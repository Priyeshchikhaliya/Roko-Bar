import {
  CONTRACT_BUCKET,
  readMultipartPdf,
  sanitizeBookingForGuest,
  sendUploadValidationError,
  uploadPdfToContractBucket,
} from "../api/_contracts.js";
import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { confirmationEmail } from "../api/_email-content.js";
import { formatNight, normalizeEmailLanguage, sendEmail } from "../api/_email.js";
import { privateBookingUrl } from "../api/_links.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function hasOtherConfirmedBooking(supabase, night, bookingId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("night", night)
    .eq("status", "confirmed")
    .neq("id", bookingId)
    .limit(1);

  if (error) throw error;

  return data.length > 0;
}

function rentPaymentReady(booking) {
  if (!booking.rent_paid) return false;
  if (booking.payment_method === "cash") return true;
  if (booking.payment_method === "online") return Boolean(booking.rent_proof_path);
  return false;
}

async function finalContractAttachment(supabase, booking) {
  const storagePath = booking.final_contract_path || `final/${booking.id}.pdf`;

  try {
    const { data, error } = await supabase.storage
      .from(CONTRACT_BUCKET)
      .download(storagePath);

    if (error) {
      console.warn("booking confirmation final contract attachment skipped", {
        bookingId: booking.id,
        storagePath,
        error,
      });
      return null;
    }

    if (!data) {
      console.warn(
        "booking confirmation final contract attachment skipped: no download data",
        {
          bookingId: booking.id,
          storagePath,
        }
      );
      return null;
    }

    return {
      filename: "roko-bar-mietvertrag-final.pdf",
      content: Buffer.from(await data.arrayBuffer()),
      content_type: "application/pdf",
    };
  } catch (error) {
    console.warn("booking confirmation final contract attachment skipped", {
      bookingId: booking.id,
      storagePath,
      error,
    });
    return null;
  }
}

async function sendConfirmationEmail(booking, supabase) {
  const attachment = await finalContractAttachment(supabase, booking);
  const lang = normalizeEmailLanguage(booking.lang);
  const message = confirmationEmail(booking, {
    nightLabel: formatNight(booking.night, lang),
    price: booking.price,
    bookingUrl: privateBookingUrl(booking.access_token),
  });

  await sendEmail({
    to: booking.email,
    subject: message.subject,
    html: message.html,
    attachments: attachment ? [attachment] : undefined,
  });
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  const id = getQueryValue(req, "id");

  try {
    const supabase = getSupabase();
    const { data: booking, error: loadError } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("id", id)
      .single();

    if (loadError) {
      if (isNotFoundError(loadError)) {
        return sendError(req, res, 404, "booking_not_found");
      }

      throw loadError;
    }

    if (booking.status !== "signed" || !booking.signed_contract_path) {
      return sendError(req, res, 409, "cannot_counter_sign");
    }

    if (sanitizeBookingForGuest(booking).status === "expired") {
      return sendError(req, res, 409, "approval_deadline_passed");
    }

    if (!rentPaymentReady(booking)) {
      if (!booking.payment_method) {
        return sendError(req, res, 409, "payment_method_required");
      }

      if (booking.payment_method === "online" && !booking.rent_proof_path) {
        return sendError(req, res, 409, "payment_proof_required");
      }

      return sendError(req, res, 409, "rent_not_paid");
    }

    if (await hasOtherConfirmedBooking(supabase, booking.night, id)) {
      return sendError(req, res, 409, "conflict_confirmed");
    }

    const validation = await readMultipartPdf(req);
    if (validation.code) {
      return sendUploadValidationError(req, res, validation);
    }

    const storagePath = `final/${booking.id}.pdf`;
    await uploadPdfToContractBucket(supabase, storagePath, validation.file.buffer);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("bookings")
      .update({
        final_contract_path: storagePath,
        countersigned_at: now,
        status: "confirmed",
      })
      .eq("id", booking.id)
      .eq("status", "signed")
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return sendError(req, res, 409, "conflict_confirmed");
      }

      // Lost a race: the booking left "signed" (e.g. a redo) before this update.
      if (isNotFoundError(error)) {
        return sendError(req, res, 409, "cannot_counter_sign");
      }

      throw error;
    }

    try {
      await sendConfirmationEmail(data, supabase);
    } catch (emailError) {
      console.error("booking confirmation email error", emailError);
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking countersign error", error);
    return sendError(req, res, 500, "countersign_failed");
  }
}
