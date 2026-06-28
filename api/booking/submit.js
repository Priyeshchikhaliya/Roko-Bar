import {
  CONTRACT_BUCKET,
  PAYMENT_PROOF_BUCKET,
  firstMultipartFile,
  readMultipartForm,
  sanitizeBookingForGuest,
  uploadPaymentProofToBucket,
  uploadPdfToContractBucket,
  validatePaymentProofFile,
  validatePdfFile,
} from "../_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../_adminUtils.js";
import { normalizePaymentMethod } from "../_payments.js";
import { methodNotAllowed, sendError, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_SUBMIT_BYTES = 2 * 4 * 1024 * 1024 + 1024 * 1024;

async function cleanupUploadedFiles(supabase, uploadedFiles) {
  await Promise.allSettled(
    uploadedFiles.map(({ bucket, path }) =>
      supabase.storage.from(bucket).remove([path])
    )
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  const token = getQueryValue(req, "token");

  if (typeof token !== "string" || token.trim() === "") {
    return sendError(req, res, 400, "missing_booking_token");
  }

  const form = await readMultipartForm(req, {
    maxBytes: MAX_SUBMIT_BYTES,
    multipartCode: "signed_contract_upload_required",
    sizeCode: "submit_size",
  });

  if (form.code) {
    return sendError(req, res, form.statusCode || 400, form.code);
  }

  const paymentMethodRaw = form.fields.payment_method || form.fields.method || "";
  const paymentMethod = normalizePaymentMethod(paymentMethodRaw, { nullable: false });

  if (!paymentMethodRaw) {
    return sendError(req, res, 400, "payment_method_required");
  }

  if (!paymentMethod) {
    return sendError(req, res, 400, "payment_method_invalid");
  }

  const signedContract = firstMultipartFile(form.files, [
    "signed_contract",
    "contract",
    "file",
  ]);
  const contractValidation = validatePdfFile(signedContract);

  if (contractValidation.code) {
    return sendError(
      req,
      res,
      contractValidation.statusCode || 400,
      contractValidation.code
    );
  }

  const proofFile = firstMultipartFile(form.files, [
    "payment_proof",
    "proof",
    "rent_proof",
  ]);
  let proofValidation = null;

  if (paymentMethod === "online") {
    proofValidation = validatePaymentProofFile(proofFile);

    if (proofValidation.code) {
      return sendError(
        req,
        res,
        proofValidation.statusCode || 400,
        proofValidation.code === "proof_missing"
          ? "payment_proof_required"
          : proofValidation.code
      );
    }
  }

  const uploadedFiles = [];
  let supabase;

  try {
    supabase = getSupabase();

    const { data: booking, error: loadError } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("access_token", token.trim())
      .single();

    if (loadError) {
      if (isNotFoundError(loadError)) {
        return sendError(req, res, 404, "booking_not_found");
      }

      throw loadError;
    }

    const publicBooking = sanitizeBookingForGuest(booking);

    if (publicBooking.status === "expired") {
      return sendError(req, res, 409, "approval_deadline_passed");
    }

    if (booking.status !== "approved") {
      return sendError(req, res, 409, "booking_submit_not_ready");
    }

    const signedContractPath = `signed/${booking.id}.pdf`;
    await uploadPdfToContractBucket(
      supabase,
      signedContractPath,
      contractValidation.file.buffer
    );
    uploadedFiles.push({ bucket: CONTRACT_BUCKET, path: signedContractPath });

    let rentProofPath = null;

    if (paymentMethod === "online") {
      rentProofPath = `rent/${booking.id}.${proofValidation.file.extension}`;
      await uploadPaymentProofToBucket(
        supabase,
        rentProofPath,
        proofValidation.file.buffer,
        proofValidation.file.contentType
      );
      uploadedFiles.push({ bucket: PAYMENT_PROOF_BUCKET, path: rentProofPath });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        signed_contract_path: signedContractPath,
        rent_proof_path: rentProofPath,
        payment_method: paymentMethod,
        rent_paid: false,
        rent_paid_at: null,
        status: "signed",
      })
      .eq("id", booking.id)
      .eq("status", "approved")
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      await cleanupUploadedFiles(supabase, uploadedFiles);

      if (isNotFoundError(error)) {
        return sendError(req, res, 409, "booking_submit_not_ready");
      }

      throw error;
    }

    return sendJson(res, 200, { booking: sanitizeBookingForGuest(data) });
  } catch (error) {
    if (supabase && uploadedFiles.length > 0) {
      await cleanupUploadedFiles(supabase, uploadedFiles);
    }

    console.error("booking submit error", error);
    return sendError(req, res, 500, "submit_failed");
  }
}
