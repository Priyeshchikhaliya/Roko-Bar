import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

const MAX_CONTRACT_BYTES = 4 * 1024 * 1024;
const MAX_PROOF_BYTES = 4 * 1024 * 1024;
const PAYMENT_METHODS = ["cash", "online"];

const COPY = {
  de: {
    pageTitle: "Buchungsstatus | RoKo Bar",
    eyebrow: "Privater Buchungslink",
    loading: "Buchung wird geladen...",
    notFound: "Dieser private Link ist nicht gueltig oder nicht mehr aktiv.",
    genericError: "Die Buchung konnte nicht geladen werden.",
    retry: "Erneut laden",
    statusLabel: "Status",
    nextLabel: "Naechster Schritt",
    bookingTitle: "Deine Buchung",
    downloadContract: "Vertrag herunterladen",
    downloadRules: "Hausordnung herunterladen",
    downloadFinal: "Finalen Vertrag herunterladen",
    submitButton: "Submit / Absenden",
    sending: "Wird gesendet...",
    successTitle: "Gesendet.",
    successSaved: "Deine Angaben wurden gespeichert.",
    successWaitingProof:
      "Deine Angaben wurden gespeichert. Der Zahlungsnachweis kann nach der Ueberweisung nachgereicht werden.",
    successWaitingReview:
      "Deine Unterlagen sind angekommen. Die Tutor:innen pruefen sie und zeichnen den Vertrag gegen.",
    fixErrors: "Bitte pruefe die markierten Felder.",
    nothingToSubmit: "Es gibt keine neuen Angaben oder Dateien zum Absenden.",
    date: "Termin",
    rent: "Miete",
    deposit: "Kaution",
    depositSuffix: "bar",
    contract: "Vertrag",
    deadline: "Frist",
    missingDeadline: "Nicht gesetzt",
    signedUploaded: "Unterschriebener Vertrag",
    proofUploaded: "Zahlungsnachweis",
    finalUploaded: "Finaler Vertrag",
    yes: "Ja",
    no: "Nein",
    step1Title: "Dein Vertrag",
    step1Meta: "Schritt 1",
    step1Body:
      "Lade Vertrag und Hausordnung herunter. Unterschreibe den Vertrag und speichere ihn als PDF.",
    step2Title: "Unterschreiben & bezahlen",
    step2Meta: "Schritt 2",
    step2Body:
      "Fuege den unterschriebenen Vertrag hinzu, waehle die Mietzahlung und sende alles mit einem Klick ab.",
    signedContractLabel: "Unterschriebener Vertrag",
    chooseContract: "PDF auswaehlen",
    replaceContract: "Neue PDF auswaehlen",
    contractHint: "PDF, maximal 4 MB.",
    contractAlreadyUploaded:
      "Es ist bereits ein Vertrag hochgeladen. Du kannst ihn bis zur Bestaetigung ersetzen.",
    contractRequired: "Bitte lade den unterschriebenen Vertrag als PDF hoch.",
    contractTypeError: "Der unterschriebene Vertrag muss eine PDF-Datei sein.",
    contractSizeError: "Der unterschriebene Vertrag darf maximal 4 MB gross sein.",
    paymentMethodLabel: "Wie moechtest du die Miete bezahlen?",
    paymentRequired: "Bitte waehle Barzahlung oder Online-Ueberweisung.",
    paymentMethods: {
      cash: "Barzahlung",
      online: "Online-Ueberweisung",
    },
    cashPaymentNote:
      "Die Miete zahlst du bar nach Absprache oder spaetestens bei der Schluesseluebergabe.",
    onlinePaymentNote:
      "Ueberweise die Miete mit dem Verwendungszweck unten. Den Nachweis kannst du direkt oder spaeter hochladen.",
    bankDetails: "Bankdaten",
    bankName: "Bank",
    bankHolder: "Kontoinhaber",
    bankIban: "IBAN",
    paymentReference: "Verwendungszweck",
    bankMissing:
      "Die Bankdaten sind noch nicht konfiguriert. Bitte melde dich bei den Bar-Tutor:innen.",
    proofLabel: "Zahlungsnachweis",
    chooseProof: "Nachweis auswaehlen",
    replaceProof: "Neuen Nachweis auswaehlen",
    proofHint: "PDF, JPG oder PNG, maximal 4 MB.",
    proofAlreadyUploaded:
      "Es ist bereits ein Zahlungsnachweis hochgeladen. Du kannst ihn bis zur Bestaetigung ersetzen.",
    proofTypeError: "Der Zahlungsnachweis muss PDF, JPG oder PNG sein.",
    proofSizeError: "Der Zahlungsnachweis darf maximal 4 MB gross sein.",
    confirmationPending:
      "Die Buchung wird bestaetigt, sobald ein:e Tutor:in die Unterlagen geprueft und den Vertrag gegengezeichnet hat.",
    finalTitle: "Alles bereit",
    finalBody:
      "Deine Buchung ist bestaetigt. Lade hier den gegengezeichneten Vertrag herunter.",
    cashReminder: "Bitte denke an die 200 EUR Kaution bar bei der Uebergabe.",
    blockedHint:
      "Dieser Link zeigt den aktuellen Stand. Fuer Aenderungen melde dich bitte bei den Bar-Tutor:innen.",
    needed: {
      pending:
        "Deine Anfrage wird noch geprueft. Du bekommst eine E-Mail nach der Freigabe.",
      approved:
        "Vertrag herunterladen, unterschreiben, Zahlungsart waehlen und absenden.",
      signedOnlineMissingProof:
        "Zahlungsnachweis hochladen oder bereits gesendete Dateien ersetzen.",
      signed:
        "Wir pruefen deine Unterlagen. Bis zur Bestaetigung kannst du Dateien ersetzen.",
      confirmed: "Der finale Vertrag ist bereit.",
      rejected: "Diese Anfrage wurde abgelehnt.",
      cancelled: "Diese Buchung wurde storniert.",
      expired: "Die Upload-Frist ist abgelaufen.",
    },
    statuses: {
      pending: "In Pruefung",
      approved: "Freigegeben",
      signed: "Hochgeladen",
      confirmed: "Bestaetigt",
      rejected: "Abgelehnt",
      cancelled: "Storniert",
      expired: "Abgelaufen",
    },
  },
  en: {
    pageTitle: "Booking status | RoKo Bar",
    eyebrow: "Private booking link",
    loading: "Loading booking...",
    notFound: "This private link is not valid or no longer active.",
    genericError: "Could not load the booking.",
    retry: "Try again",
    statusLabel: "Status",
    nextLabel: "Next step",
    bookingTitle: "Your booking",
    downloadContract: "Download contract",
    downloadRules: "Download house rules",
    downloadFinal: "Download final contract",
    submitButton: "Submit / Absenden",
    sending: "Sending...",
    successTitle: "Submitted.",
    successSaved: "Your details were saved.",
    successWaitingProof:
      "Your details were saved. You can upload payment proof after the transfer.",
    successWaitingReview:
      "Your documents were received. The tutors will review them and counter-sign the contract.",
    fixErrors: "Please check the highlighted fields.",
    nothingToSubmit: "There are no new details or files to submit.",
    date: "Date",
    rent: "Rent",
    deposit: "Deposit",
    depositSuffix: "cash",
    contract: "Contract",
    deadline: "Deadline",
    missingDeadline: "Not set",
    signedUploaded: "Signed contract",
    proofUploaded: "Payment proof",
    finalUploaded: "Final contract",
    yes: "Yes",
    no: "No",
    step1Title: "Your contract",
    step1Meta: "Step 1",
    step1Body:
      "Download the contract and house rules. Sign the contract and save it as a PDF.",
    step2Title: "Sign & pay",
    step2Meta: "Step 2",
    step2Body:
      "Attach the signed contract, choose the rent payment method, and submit everything with one button.",
    signedContractLabel: "Signed contract",
    chooseContract: "Choose PDF",
    replaceContract: "Choose new PDF",
    contractHint: "PDF, up to 4 MB.",
    contractAlreadyUploaded:
      "A signed contract is already uploaded. You can replace it until confirmation.",
    contractRequired: "Please upload the signed contract as a PDF.",
    contractTypeError: "The signed contract must be a PDF file.",
    contractSizeError: "The signed contract must be 4 MB or smaller.",
    paymentMethodLabel: "How will you pay the rent?",
    paymentRequired: "Please choose cash or online bank transfer.",
    paymentMethods: {
      cash: "Cash",
      online: "Online bank transfer",
    },
    cashPaymentNote:
      "Pay the rent in cash by arrangement or at the latest on key-handover day.",
    onlinePaymentNote:
      "Transfer the rent using the reference below. You can upload proof now or later.",
    bankDetails: "Bank details",
    bankName: "Bank",
    bankHolder: "Account holder",
    bankIban: "IBAN",
    paymentReference: "Payment reference",
    bankMissing:
      "Bank details are not configured yet. Please contact the bar tutors.",
    proofLabel: "Payment proof",
    chooseProof: "Choose proof",
    replaceProof: "Choose new proof",
    proofHint: "PDF, JPG, or PNG, up to 4 MB.",
    proofAlreadyUploaded:
      "A payment proof is already uploaded. You can replace it until confirmation.",
    proofTypeError: "Payment proof must be PDF, JPG, or PNG.",
    proofSizeError: "Payment proof must be 4 MB or smaller.",
    confirmationPending:
      "The booking is confirmed after a tutor reviews the documents and counter-signs the contract.",
    finalTitle: "You are all set",
    finalBody:
      "Your booking is confirmed. Download the counter-signed contract here.",
    cashReminder: "Please remember the 200 EUR cash deposit at handover.",
    blockedHint:
      "This link shows the current status. Please contact the bar tutors for changes.",
    needed: {
      pending:
        "Your request is still under review. You will receive an email after approval.",
      approved:
        "Download the contract, sign it, choose payment, and submit.",
      signedOnlineMissingProof:
        "Upload payment proof or replace files you already sent.",
      signed:
        "We are reviewing your documents. You can replace files until confirmation.",
      confirmed: "The final contract is ready.",
      rejected: "This request was rejected.",
      cancelled: "This booking was cancelled.",
      expired: "The upload deadline has passed.",
    },
    statuses: {
      pending: "In review",
      approved: "Approved",
      signed: "Uploaded",
      confirmed: "Confirmed",
      rejected: "Rejected",
      cancelled: "Cancelled",
      expired: "Expired",
    },
  },
};

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatNight(iso, lang) {
  const date = parseIsoDate(iso);
  if (!date) return iso || "";

  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDateTime(value, lang, fallback) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
    timeZoneName: "short",
  }).format(date);
}

function formatMoney(value, lang) {
  return new Intl.NumberFormat(lang === "en" ? "en-GB" : "de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function statusClass(status) {
  if (status === "confirmed") {
    return "border-success bg-surface text-success";
  }

  if (status === "signed") {
    return "border-sky bg-surface text-sky";
  }

  if (status === "approved") {
    return "border-warning bg-surface text-warning";
  }

  if (status === "rejected" || status === "cancelled" || status === "expired") {
    return "border-line bg-paper text-muted";
  }

  return "border-primary bg-brick-tint text-primary-dark";
}

function fileUrl(token, which) {
  return `/api/booking/file?token=${encodeURIComponent(token)}&which=${which}`;
}

function isPdfFile(file) {
  if (!file) return false;

  const type = file.type || "";
  return (
    file.name.toLowerCase().endsWith(".pdf") &&
    (!type || type === "application/pdf" || type === "application/octet-stream")
  );
}

function isAcceptedProofFile(file) {
  if (!file) return false;

  const name = file.name.toLowerCase();
  const type = file.type || "";
  const hasAcceptedName =
    name.endsWith(".pdf") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg");
  const hasAcceptedType =
    !type ||
    type === "application/pdf" ||
    type === "application/octet-stream" ||
    type === "image/png" ||
    type === "image/jpeg" ||
    type === "image/jpg";

  return hasAcceptedName && hasAcceptedType;
}

async function readJsonOrText(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.trim().slice(0, 280) };
  }
}

async function apiJson(url, options, fallback) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", ...(options?.headers || {}) },
    ...options,
  });
  const data = await readJsonOrText(response);

  if (!response.ok) {
    const error = new Error(data.error || fallback);
    error.status = response.status;
    throw error;
  }

  return data;
}

function getNeededText(booking, copy) {
  if (!booking) return "";

  if (
    booking.status === "signed" &&
    booking.payment_method === "online" &&
    !booking.hasRentProof
  ) {
    return copy.needed.signedOnlineMissingProof;
  }

  return copy.needed[booking.status] || copy.needed.pending;
}

function hasBankDetails(booking) {
  return Boolean(booking?.bankDetails?.iban && booking?.bankDetails?.holder);
}

export default function BookingStatus() {
  const { token = "" } = useParams();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.de;
  const [booking, setBooking] = useState(null);
  const [loadStatus, setLoadStatus] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [contractFile, setContractFile] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [formMessage, setFormMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [inputVersion, setInputVersion] = useState(0);

  const loadBooking = useCallback(async () => {
    setLoadStatus("loading");
    setLoadError("");

    try {
      const data = await apiJson(
        `/api/booking/status?token=${encodeURIComponent(token)}`,
        undefined,
        copy.genericError
      );
      setBooking(data.booking);
      setSelectedPaymentMethod(data.booking?.payment_method || "");
      setLoadStatus("ready");
    } catch (error) {
      setLoadStatus("error");
      setLoadError(error.status === 404 ? copy.notFound : error.message);
    }
  }, [copy.genericError, copy.notFound, token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadBooking();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBooking]);

  const canDownloadBlankFiles =
    booking?.status === "approved" ||
    booking?.status === "signed" ||
    booking?.status === "confirmed";
  const canEdit = booking?.status === "approved" || booking?.status === "signed";
  const canDownloadFinal = booking?.status === "confirmed" && booking.hasFinalContract;
  const isSending = submitStatus === "sending";
  const selectedOnline = selectedPaymentMethod === "online";
  const bankConfigured = hasBankDetails(booking);
  const neededText = useMemo(() => getNeededText(booking, copy), [booking, copy]);

  const onContractChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setContractFile(selected);
    setFormMessage(null);
    setFieldErrors((current) => ({ ...current, contract: "" }));
  };

  const onProofChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setProofFile(selected);
    setFormMessage(null);
    setFieldErrors((current) => ({ ...current, proof: "" }));
  };

  const onPaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setFormMessage(null);
    setFieldErrors((current) => ({ ...current, payment: "" }));
  };

  const validateSubmission = () => {
    const errors = {};

    if (booking.status === "approved" && !contractFile) {
      errors.contract = copy.contractRequired;
    }

    if (contractFile && !isPdfFile(contractFile)) {
      errors.contract = copy.contractTypeError;
    } else if (contractFile && contractFile.size > MAX_CONTRACT_BYTES) {
      errors.contract = copy.contractSizeError;
    }

    if (!selectedPaymentMethod) {
      errors.payment = copy.paymentRequired;
    }

    if (selectedOnline && !bankConfigured) {
      errors.payment = copy.bankMissing;
    }

    if (proofFile && !isAcceptedProofFile(proofFile)) {
      errors.proof = copy.proofTypeError;
    } else if (proofFile && proofFile.size > MAX_PROOF_BYTES) {
      errors.proof = copy.proofSizeError;
    }

    const methodChanged =
      Boolean(selectedPaymentMethod) &&
      selectedPaymentMethod !== booking.payment_method;
    const hasChanges = Boolean(contractFile || proofFile || methodChanged);

    if (Object.keys(errors).length === 0 && !hasChanges) {
      errors.form = copy.nothingToSubmit;
    }

    return errors;
  };

  const uploadContract = async () => {
    const body = new FormData();
    body.append("file", contractFile);

    const data = await apiJson(
      `/api/booking/upload?token=${encodeURIComponent(token)}`,
      { method: "POST", body },
      "Signed contract upload failed."
    );
    setBooking(data.booking);
    return data.booking;
  };

  const savePaymentMethod = async (paymentMethod) => {
    const data = await apiJson(
      `/api/booking/payment-method?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: paymentMethod }),
      },
      "Payment method could not be saved."
    );
    setBooking(data.booking);
    return data.booking;
  };

  const uploadProof = async () => {
    const body = new FormData();
    body.append("file", proofFile);

    const data = await apiJson(
      `/api/booking/payment-proof?token=${encodeURIComponent(token)}`,
      { method: "POST", body },
      "Payment proof upload failed."
    );
    setBooking(data.booking);
    return data.booking;
  };

  const submitFlow = async (event) => {
    event.preventDefault();
    if (!canEdit || isSending) return;

    const errors = validateSubmission();
    setFieldErrors(errors);

    if (errors.form) {
      setFormMessage({ type: "error", text: errors.form });
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormMessage({ type: "error", text: copy.fixErrors });
      return;
    }

    setSubmitStatus("sending");
    setFormMessage(null);

    try {
      let latestBooking = booking;

      if (contractFile) {
        latestBooking = await uploadContract();
      }

      if (selectedPaymentMethod !== latestBooking.payment_method) {
        latestBooking = await savePaymentMethod(selectedPaymentMethod);
      }

      if (selectedPaymentMethod === "online" && proofFile) {
        latestBooking = await uploadProof();
      }

      setContractFile(null);
      setProofFile(null);
      setInputVersion((value) => value + 1);
      setSubmitStatus("idle");
      setFieldErrors({});

      const text =
        selectedPaymentMethod === "online" && !latestBooking.hasRentProof
          ? copy.successWaitingProof
          : latestBooking.status === "signed"
            ? copy.successWaitingReview
            : copy.successSaved;

      setFormMessage({ type: "success", text: `${copy.successTitle} ${text}` });
    } catch (error) {
      setSubmitStatus("idle");
      setFormMessage({ type: "error", text: error.message });
      if (error.status === 409) {
        await loadBooking();
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <section className="editorial-section section-paper border-t-0 py-10 md:py-14">
        <div className="container-wide max-w-6xl select-text space-y-6">
          {loadStatus === "loading" || loadStatus === "idle" ? (
            <div className="flat-panel">
              <p className="font-semibold">{copy.loading}</p>
            </div>
          ) : null}

          {loadStatus === "error" ? (
            <div className="flat-panel space-y-4">
              <p className="font-semibold text-danger">{loadError}</p>
              <button className="btn-secondary" onClick={loadBooking} type="button">
                {copy.retry}
              </button>
            </div>
          ) : null}

          {loadStatus === "ready" && booking ? (
            <>
              <StatusHeader
                booking={booking}
                copy={copy}
                lang={lang}
                neededText={neededText}
              />

              {booking.status === "confirmed" ? (
                <AllSetPanel
                  canDownloadFinal={canDownloadFinal}
                  copy={copy}
                  token={token}
                />
              ) : null}

              {canEdit ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="space-y-5">
                    <StepBlock meta={copy.step1Meta} title={copy.step1Title}>
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted">
                          {copy.step1Body}
                        </p>
                        {canDownloadBlankFiles ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <a
                              className="btn-primary min-h-12 w-full sm:w-auto"
                              href={fileUrl(token, "contract")}
                            >
                              {copy.downloadContract}
                            </a>
                            <a
                              className="btn-secondary min-h-12 w-full sm:w-auto"
                              href={fileUrl(token, "rules")}
                            >
                              {copy.downloadRules}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </StepBlock>

                    <StepBlock meta={copy.step2Meta} title={copy.step2Title}>
                      <form className="space-y-6" onSubmit={submitFlow}>
                        <p className="text-sm leading-relaxed text-muted">
                          {copy.step2Body}
                        </p>

                        <FileField
                          alreadyUploaded={booking.hasSignedContract}
                          alreadyUploadedText={copy.contractAlreadyUploaded}
                          chooseText={
                            booking.hasSignedContract
                              ? copy.replaceContract
                              : copy.chooseContract
                          }
                          disabled={isSending}
                          error={fieldErrors.contract}
                          file={contractFile}
                          hint={copy.contractHint}
                          inputKey={`contract-${inputVersion}`}
                          label={copy.signedContractLabel}
                          onChange={onContractChange}
                          accept="application/pdf,.pdf"
                        />

                        <PaymentMethodPicker
                          copy={copy}
                          disabled={isSending}
                          error={fieldErrors.payment}
                          selected={selectedPaymentMethod}
                          onSelect={onPaymentMethodChange}
                        />

                        {selectedPaymentMethod === "cash" ? (
                          <div className="border border-line bg-paper p-4 text-sm leading-relaxed text-muted">
                            {copy.cashPaymentNote}
                          </div>
                        ) : null}

                        {selectedOnline ? (
                          <OnlinePaymentFields
                            booking={booking}
                            copy={copy}
                            disabled={isSending}
                            error={fieldErrors.proof}
                            inputVersion={inputVersion}
                            onProofChange={onProofChange}
                            proofFile={proofFile}
                          />
                        ) : null}

                        <div className="space-y-3 border-t border-line pt-5">
                          <button
                            className="btn-primary min-h-12 w-full sm:w-auto"
                            disabled={isSending}
                            type="submit"
                          >
                            {isSending ? copy.sending : copy.submitButton}
                          </button>
                          <FormNotice message={formMessage} />
                        </div>
                      </form>
                    </StepBlock>
                  </div>

                  <BookingDetails booking={booking} copy={copy} lang={lang} />
                </div>
              ) : null}

              {!canEdit && booking.status !== "confirmed" ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="flat-panel space-y-4">
                    <p className="text-sm leading-relaxed text-muted">
                      {copy.blockedHint}
                    </p>
                    {canDownloadBlankFiles ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <a
                          className="btn-secondary min-h-12 w-full sm:w-auto"
                          href={fileUrl(token, "contract")}
                        >
                          {copy.downloadContract}
                        </a>
                        <a
                          className="btn-secondary min-h-12 w-full sm:w-auto"
                          href={fileUrl(token, "rules")}
                        >
                          {copy.downloadRules}
                        </a>
                      </div>
                    ) : null}
                  </div>
                  <BookingDetails booking={booking} copy={copy} lang={lang} />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}

function StatusHeader({ booking, copy, lang, neededText }) {
  return (
    <header className="flat-panel space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="eyebrow">{copy.eyebrow}</p>
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-semibold md:text-5xl">
              {formatNight(booking.night, lang)}
            </h1>
            <p className="text-base font-semibold text-muted">{copy.bookingTitle}</p>
          </div>
        </div>
        <span
          className={[
            "inline-flex w-fit border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]",
            statusClass(booking.status),
          ].join(" ")}
        >
          {copy.statuses[booking.status] || booking.status}
        </span>
      </div>

      <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        <HeaderFact label={copy.statusLabel} value={copy.statuses[booking.status]} />
        <HeaderFact label={copy.nextLabel} value={neededText} />
      </div>
    </header>
  );
}

function HeaderFact({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function StepBlock({ children, meta, title }) {
  return (
    <section className="flat-panel space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {meta}
        </p>
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FileField({
  accept,
  alreadyUploaded,
  alreadyUploadedText,
  chooseText,
  disabled,
  error,
  file,
  hint,
  inputKey,
  label,
  onChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-ink">{label}</div>
          <p className="text-sm text-muted">{hint}</p>
        </div>
        {alreadyUploaded ? (
          <span className="text-sm font-semibold text-success">
            {alreadyUploadedText}
          </span>
        ) : null}
      </div>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          {chooseText}
        </span>
        <input
          key={inputKey}
          accept={accept}
          className="form-input min-h-12 w-full px-3 py-2"
          disabled={disabled}
          onChange={onChange}
          type="file"
        />
      </label>
      {file ? <p className="break-words text-sm font-semibold">{file.name}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

function PaymentMethodPicker({ copy, disabled, error, onSelect, selected }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-ink">{copy.paymentMethodLabel}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            className={[
              "min-h-12 border px-4 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              selected === method
                ? "border-primary bg-brick-tint text-primary-dark"
                : "border-line bg-surface text-ink hover:border-primary",
            ].join(" ")}
            disabled={disabled}
            key={method}
            onClick={() => onSelect(method)}
            type="button"
          >
            {copy.paymentMethods[method]}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function OnlinePaymentFields({
  booking,
  copy,
  disabled,
  error,
  inputVersion,
  onProofChange,
  proofFile,
}) {
  const bankDetails = booking.bankDetails || {};
  const configured = hasBankDetails(booking);

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">{copy.onlinePaymentNote}</p>

      <div className="border border-line bg-paper p-4">
        <h3 className="text-sm font-semibold">{copy.bankDetails}</h3>
        {configured ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {bankDetails.name ? (
              <PaymentDetail label={copy.bankName} value={bankDetails.name} />
            ) : null}
            <PaymentDetail label={copy.bankHolder} value={bankDetails.holder} />
            <PaymentDetail label={copy.bankIban} value={bankDetails.iban} mono />
            <PaymentDetail
              label={copy.paymentReference}
              value={booking.paymentReference}
              mono
            />
          </dl>
        ) : (
          <p className="mt-3 text-sm font-semibold text-danger">
            {copy.bankMissing}
          </p>
        )}
      </div>

      <FileField
        accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
        alreadyUploaded={booking.hasRentProof}
        alreadyUploadedText={copy.proofAlreadyUploaded}
        chooseText={booking.hasRentProof ? copy.replaceProof : copy.chooseProof}
        disabled={disabled}
        error={error}
        file={proofFile}
        hint={copy.proofHint}
        inputKey={`proof-${inputVersion}`}
        label={copy.proofLabel}
        onChange={onProofChange}
      />

      <p className="border-l border-primary pl-4 text-sm leading-relaxed text-muted">
        {copy.confirmationPending}
      </p>
    </div>
  );
}

function PaymentDetail({ label, mono = false, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd
        className={[
          "mt-1 break-words font-semibold text-ink",
          mono ? "font-mono text-xs" : "",
        ].join(" ")}
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function BookingDetails({ booking, copy, lang }) {
  return (
    <aside className="flat-panel h-fit space-y-4">
      <DetailRow label={copy.date} value={formatNight(booking.night, lang)} />
      <DetailRow label={copy.rent} value={formatMoney(booking.price, lang)} />
      <DetailRow
        label={copy.deposit}
        value={`${formatMoney(booking.deposit, lang)} ${copy.depositSuffix}`}
      />
      <DetailRow label={copy.contract} value={booking.contract.label} />
      <DetailRow
        label={copy.deadline}
        value={formatDateTime(booking.confirm_deadline, lang, copy.missingDeadline)}
      />
      <DetailRow
        label={copy.signedUploaded}
        value={booking.hasSignedContract ? copy.yes : copy.no}
      />
      <DetailRow
        label={copy.proofUploaded}
        value={booking.hasRentProof ? copy.yes : copy.no}
      />
      <DetailRow
        label={copy.finalUploaded}
        value={booking.hasFinalContract ? copy.yes : copy.no}
      />
    </aside>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-line pb-3 last:border-b-0 last:pb-0">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function AllSetPanel({ canDownloadFinal, copy, token }) {
  return (
    <div className="flat-panel space-y-4">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-semibold">{copy.finalTitle}</h2>
        <p className="text-sm leading-relaxed text-muted">{copy.finalBody}</p>
      </div>
      {canDownloadFinal ? (
        <a className="btn-primary min-h-12 w-full sm:w-auto" href={fileUrl(token, "final")}>
          {copy.downloadFinal}
        </a>
      ) : null}
      <p className="text-sm font-semibold text-success">{copy.cashReminder}</p>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  );
}

function FormNotice({ message }) {
  if (!message) return null;

  const isError = message.type === "error";

  return (
    <p
      className={[
        "text-sm font-semibold",
        isError ? "text-danger" : "text-success",
      ].join(" ")}
      role={isError ? "alert" : "status"}
    >
      {message.text}
    </p>
  );
}
