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
    loading: "Buchung wird geladen ...",
    notFound: "Dieser private Link ist nicht gültig oder nicht mehr aktiv.",
    genericError: "Die Buchung konnte nicht geladen werden.",
    retry: "Erneut laden",
    statusLabel: "Status",
    nextLabel: "Nächster Schritt",
    bookingTitle: "Deine Buchung",
    summaryTitle: "Buchungsübersicht",
    downloadContract: "Vertrag herunterladen",
    downloadRules: "Hausordnung herunterladen",
    downloadFinal: "Finalen Vertrag herunterladen",
    submitButton: "Absenden",
    sending: "Wird gesendet ...",
    submitted: "Deine Unterlagen wurden übermittelt.",
    formTitle: "Unterlagen einreichen",
    formIntro:
      "Lade Vertrag und Hausordnung herunter, unterschreibe den Vertrag und sende anschließend alle erforderlichen Angaben gemeinsam ab.",
    signedContractLabel: "Unterschriebener Vertrag",
    chooseContract: "PDF auswählen",
    contractHint: "PDF, maximal 4 MB.",
    contractRequired: "Bitte lade den unterschriebenen Vertrag als PDF hoch.",
    contractTypeError: "Der unterschriebene Vertrag muss eine PDF-Datei sein.",
    contractSizeError: "Der unterschriebene Vertrag darf maximal 4 MB groß sein.",
    paymentMethodLabel: "Wie möchtest du die Miete bezahlen?",
    paymentRequired: "Bitte wähle Barzahlung oder Online-Überweisung.",
    paymentMethods: {
      cash: "Barzahlung",
      online: "Online-Überweisung",
    },
    cashPaymentNote:
      "Die Miete zahlst du bar nach Absprache oder spätestens bei der Schlüsselübergabe.",
    onlinePaymentNote:
      "Überweise die Miete mit dem Verwendungszweck unten und lade den Zahlungsnachweis direkt mit hoch.",
    bankDetails: "Bankdaten",
    bankName: "Bank",
    bankHolder: "Kontoinhaber",
    bankIban: "IBAN",
    paymentReference: "Verwendungszweck",
    bankMissing:
      "Die Bankdaten sind noch nicht konfiguriert. Bitte melde dich bei den Bar-Tutor:innen.",
    proofLabel: "Zahlungsnachweis",
    chooseProof: "Nachweis auswählen",
    proofHint: "PDF, JPG oder PNG, maximal 4 MB.",
    proofRequired: "Bitte lade den Zahlungsnachweis hoch.",
    proofTypeError: "Der Zahlungsnachweis muss PDF, JPG oder PNG sein.",
    proofSizeError: "Der Zahlungsnachweis darf maximal 4 MB groß sein.",
    readyHint: "Alle erforderlichen Angaben sind bereit.",
    missingContractHint: "Es fehlt noch der unterschriebene Vertrag.",
    missingMethodHint: "Es fehlt noch die Zahlungsart.",
    missingProofHint: "Für Online-Überweisung fehlt noch der Zahlungsnachweis.",
    date: "Termin",
    rent: "Miete",
    deposit: "Kaution",
    depositSuffix: "bar",
    contract: "Vertrag",
    deadline: "Frist",
    missingDeadline: "Nicht gesetzt",
    paymentMethod: "Mietzahlung",
    signedUploaded: "Unterschriebener Vertrag",
    proofUploaded: "Zahlungsnachweis",
    finalUploaded: "Finaler Vertrag",
    yes: "Ja",
    no: "Nein",
    finalTitle: "Alles bereit",
    finalBody:
      "Deine Buchung ist bestätigt. Lade hier den gegengezeichneten Vertrag herunter.",
    cashReminder: "Bitte denke an die 200 EUR Kaution bar bei der Übergabe.",
    stateBodies: {
      pending:
        "Deine Anfrage wird geprüft. Du bekommst eine E-Mail, sobald ein:e Tutor:in sie freigegeben hat.",
      signed:
        "Deine Unterlagen sind angekommen. Diese Abgabe ist jetzt gesperrt; die Tutor:innen prüfen alles und zeichnen den Vertrag gegen.",
      rejected:
        "Diese Anfrage wurde abgelehnt. Für Rückfragen melde dich bitte bei den Bar-Tutor:innen.",
      cancelled:
        "Diese Buchung wurde storniert. Für Rückfragen melde dich bitte bei den Bar-Tutor:innen.",
      expired:
        "Die Upload-Frist ist abgelaufen. Bitte melde dich bei den Bar-Tutor:innen, wenn der Termin noch relevant ist.",
    },
    needed: {
      pending: "Auf Freigabe durch die Tutor:innen warten.",
      approved: "Vertrag unterschreiben, Zahlungsart wählen und alles gemeinsam absenden.",
      signed: "Auf Prüfung und Gegenzeichnung durch die Tutor:innen warten.",
      confirmed: "Finalen Vertrag herunterladen und Kaution für die Übergabe einplanen.",
      rejected: "Keine Aktion möglich.",
      cancelled: "Keine Aktion möglich.",
      expired: "Tutor:innen kontaktieren, falls du den Termin weiterhin möchtest.",
    },
    statuses: {
      pending: "In Prüfung",
      approved: "Freigegeben",
      signed: "Eingereicht",
      confirmed: "Bestätigt",
      rejected: "Abgelehnt",
      cancelled: "Storniert",
      expired: "Abgelaufen",
    },
  },
  en: {
    pageTitle: "Booking status | RoKo Bar",
    eyebrow: "Private booking link",
    loading: "Loading booking ...",
    notFound: "This private link is not valid or no longer active.",
    genericError: "Could not load the booking.",
    retry: "Try again",
    statusLabel: "Status",
    nextLabel: "Next step",
    bookingTitle: "Your booking",
    summaryTitle: "Booking summary",
    downloadContract: "Download contract",
    downloadRules: "Download house rules",
    downloadFinal: "Download final contract",
    submitButton: "Submit",
    sending: "Sending ...",
    submitted: "Your documents were submitted.",
    formTitle: "Submit documents",
    formIntro:
      "Download the contract and house rules, sign the contract, then send every required item together.",
    signedContractLabel: "Signed contract",
    chooseContract: "Choose PDF",
    contractHint: "PDF, up to 4 MB.",
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
      "Transfer the rent using the reference below and upload the payment proof with this submission.",
    bankDetails: "Bank details",
    bankName: "Bank",
    bankHolder: "Account holder",
    bankIban: "IBAN",
    paymentReference: "Payment reference",
    bankMissing:
      "Bank details are not configured yet. Please contact the bar tutors.",
    proofLabel: "Payment proof",
    chooseProof: "Choose proof",
    proofHint: "PDF, JPG, or PNG, up to 4 MB.",
    proofRequired: "Please upload the payment proof.",
    proofTypeError: "Payment proof must be PDF, JPG, or PNG.",
    proofSizeError: "Payment proof must be 4 MB or smaller.",
    readyHint: "All required items are ready.",
    missingContractHint: "The signed contract is still missing.",
    missingMethodHint: "The rent payment method is still missing.",
    missingProofHint: "Online bank transfer still needs payment proof.",
    date: "Date",
    rent: "Rent",
    deposit: "Deposit",
    depositSuffix: "cash",
    contract: "Contract",
    deadline: "Deadline",
    missingDeadline: "Not set",
    paymentMethod: "Rent payment",
    signedUploaded: "Signed contract",
    proofUploaded: "Payment proof",
    finalUploaded: "Final contract",
    yes: "Yes",
    no: "No",
    finalTitle: "You are all set",
    finalBody:
      "Your booking is confirmed. Download the counter-signed contract here.",
    cashReminder: "Please remember the 200 EUR cash deposit at handover.",
    stateBodies: {
      pending:
        "Your request is being reviewed. You will receive an email once a tutor approves it.",
      signed:
        "Your documents were received. This submission is now locked; the tutors will review everything and counter-sign the contract.",
      rejected:
        "This request was rejected. Please contact the bar tutors if you have questions.",
      cancelled:
        "This booking was cancelled. Please contact the bar tutors if you have questions.",
      expired:
        "The upload deadline has passed. Please contact the bar tutors if this date is still relevant.",
    },
    needed: {
      pending: "Wait for tutor approval.",
      approved: "Sign the contract, choose payment, and submit everything together.",
      signed: "Wait for tutor review and counter-signing.",
      confirmed: "Download the final contract and plan the cash deposit for handover.",
      rejected: "No action is available.",
      cancelled: "No action is available.",
      expired: "Contact the tutors if you still want this date.",
    },
    statuses: {
      pending: "In review",
      approved: "Approved",
      signed: "Submitted",
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

function statusClass(status) {
  if (status === "confirmed") return "border-success bg-surface text-success";
  if (status === "signed") return "border-sky bg-surface text-sky";
  if (status === "approved") return "border-warning bg-surface text-warning";
  if (status === "rejected" || status === "cancelled" || status === "expired") {
    return "border-line bg-paper text-muted";
  }

  return "border-primary bg-brick-tint text-primary-dark";
}

function fileUrl(token, which) {
  return `/api/booking/file?token=${encodeURIComponent(token)}&which=${which}`;
}

function paymentMethodText(method, copy) {
  if (method === "cash") return copy.paymentMethods.cash;
  if (method === "online") return copy.paymentMethods.online;
  return "-";
}

function hasBankDetails(booking) {
  return Boolean(booking?.bankDetails?.iban && booking?.bankDetails?.holder);
}

async function readJsonOrText(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function apiJson(url, { lang, ...options } = {}, fallback) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": lang,
      "X-Roko-Lang": lang,
      ...(options?.headers || {}),
    },
    ...options,
  });
  const data = await readJsonOrText(response);

  if (!response.ok) {
    const error = new Error(data.error || fallback);
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
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
        { lang },
        copy.genericError
      );
      setBooking(data.booking);
      setSelectedPaymentMethod(data.booking?.payment_method || "");
      setLoadStatus("ready");
    } catch (error) {
      setLoadStatus("error");
      setLoadError(error.status === 404 ? copy.notFound : error.message);
    }
  }, [copy.genericError, copy.notFound, lang, token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadBooking();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBooking]);

  const selectedOnline = selectedPaymentMethod === "online";
  const bankConfigured = hasBankDetails(booking);
  const isSending = submitStatus === "sending";

  const localValidation = useMemo(() => {
    const errors = {};

    if (!contractFile) {
      errors.contract = copy.contractRequired;
    } else if (!isPdfFile(contractFile)) {
      errors.contract = copy.contractTypeError;
    } else if (contractFile.size > MAX_CONTRACT_BYTES) {
      errors.contract = copy.contractSizeError;
    }

    if (!selectedPaymentMethod) {
      errors.payment = copy.paymentRequired;
    } else if (selectedOnline && !bankConfigured) {
      errors.payment = copy.bankMissing;
    }

    if (selectedOnline) {
      if (!proofFile) {
        errors.proof = copy.proofRequired;
      } else if (!isAcceptedProofFile(proofFile)) {
        errors.proof = copy.proofTypeError;
      } else if (proofFile.size > MAX_PROOF_BYTES) {
        errors.proof = copy.proofSizeError;
      }
    }

    return errors;
  }, [
    bankConfigured,
    contractFile,
    copy.bankMissing,
    copy.contractRequired,
    copy.contractSizeError,
    copy.contractTypeError,
    copy.paymentRequired,
    copy.proofRequired,
    copy.proofSizeError,
    copy.proofTypeError,
    proofFile,
    selectedOnline,
    selectedPaymentMethod,
  ]);

  const submitHint = useMemo(() => {
    if (!contractFile) return copy.missingContractHint;
    if (localValidation.contract) return localValidation.contract;
    if (!selectedPaymentMethod) return copy.missingMethodHint;
    if (localValidation.payment) return localValidation.payment;
    if (selectedOnline && !proofFile) return copy.missingProofHint;
    if (localValidation.proof) return localValidation.proof;
    return copy.readyHint;
  }, [
    contractFile,
    copy.missingContractHint,
    copy.missingMethodHint,
    copy.missingProofHint,
    copy.readyHint,
    localValidation.contract,
    localValidation.payment,
    localValidation.proof,
    proofFile,
    selectedOnline,
    selectedPaymentMethod,
  ]);

  const canSubmit =
    booking?.status === "approved" &&
    !isSending &&
    Object.keys(localValidation).length === 0;

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
    if (method === "cash") setProofFile(null);
    setFormMessage(null);
    setFieldErrors((current) => ({ ...current, payment: "", proof: "" }));
  };

  const submitFlow = async (event) => {
    event.preventDefault();
    if (booking?.status !== "approved" || isSending) return;

    setFieldErrors(localValidation);

    if (Object.keys(localValidation).length > 0) {
      setFormMessage({ type: "error", text: submitHint });
      return;
    }

    const body = new FormData();
    body.append("payment_method", selectedPaymentMethod);
    body.append("signed_contract", contractFile);
    if (selectedPaymentMethod === "online") {
      body.append("payment_proof", proofFile);
    }

    setSubmitStatus("sending");
    setFormMessage(null);

    try {
      const data = await apiJson(
        `/api/booking/submit?token=${encodeURIComponent(token)}`,
        { method: "POST", body, lang },
        copy.genericError
      );
      setBooking(data.booking);
      setContractFile(null);
      setProofFile(null);
      setInputVersion((value) => value + 1);
      setSubmitStatus("idle");
      setFieldErrors({});
      setFormMessage({ type: "success", text: copy.submitted });
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
                message={formMessage}
              />

              {booking.status === "approved" ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <GuestSubmitForm
                    bankConfigured={bankConfigured}
                    booking={booking}
                    canSubmit={canSubmit}
                    contractFile={contractFile}
                    copy={copy}
                    fieldErrors={fieldErrors}
                    inputVersion={inputVersion}
                    isSending={isSending}
                    lang={lang}
                    onContractChange={onContractChange}
                    onPaymentMethodChange={onPaymentMethodChange}
                    onProofChange={onProofChange}
                    onSubmit={submitFlow}
                    proofFile={proofFile}
                    selectedPaymentMethod={selectedPaymentMethod}
                    submitHint={submitHint}
                    token={token}
                  />
                  <BookingDetails booking={booking} copy={copy} lang={lang} />
                </div>
              ) : null}

              {booking.status === "confirmed" ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <AllSetPanel
                    canDownloadFinal={booking.hasFinalContract}
                    copy={copy}
                    token={token}
                  />
                  <BookingDetails booking={booking} copy={copy} lang={lang} />
                </div>
              ) : null}

              {booking.status !== "approved" && booking.status !== "confirmed" ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <StatePanel booking={booking} copy={copy} />
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

function StatusHeader({ booking, copy, lang, message }) {
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
        <HeaderFact label={copy.nextLabel} value={copy.needed[booking.status]} />
      </div>

      <FormNotice message={message} />
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

function GuestSubmitForm({
  bankConfigured,
  booking,
  canSubmit,
  contractFile,
  copy,
  fieldErrors,
  inputVersion,
  isSending,
  onContractChange,
  onPaymentMethodChange,
  onProofChange,
  onSubmit,
  proofFile,
  selectedPaymentMethod,
  submitHint,
  token,
}) {
  const selectedOnline = selectedPaymentMethod === "online";

  return (
    <form className="flat-panel space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-semibold">{copy.formTitle}</h2>
        <p className="text-sm leading-relaxed text-muted">{copy.formIntro}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a className="btn-primary min-h-12 w-full sm:w-auto" href={fileUrl(token, "contract")}>
          {copy.downloadContract}
        </a>
        <a className="btn-secondary min-h-12 w-full sm:w-auto" href={fileUrl(token, "rules")}>
          {copy.downloadRules}
        </a>
      </div>

      <FileField
        accept="application/pdf,.pdf"
        chooseText={copy.chooseContract}
        disabled={isSending}
        error={fieldErrors.contract}
        file={contractFile}
        hint={copy.contractHint}
        inputKey={`contract-${inputVersion}`}
        label={copy.signedContractLabel}
        onChange={onContractChange}
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
          bankConfigured={bankConfigured}
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
        <p className={canSubmit ? "text-sm font-semibold text-success" : "text-sm font-semibold text-muted"}>
          {submitHint}
        </p>
        <button
          className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted sm:w-auto"
          disabled={!canSubmit}
          type="submit"
        >
          {isSending ? copy.sending : copy.submitButton}
        </button>
      </div>
    </form>
  );
}

function FileField({
  accept,
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
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        <p className="text-sm text-muted">{hint}</p>
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
  bankConfigured,
  booking,
  copy,
  disabled,
  error,
  inputVersion,
  onProofChange,
  proofFile,
}) {
  const bankDetails = booking.bankDetails || {};

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">{copy.onlinePaymentNote}</p>

      <div className="border border-line bg-paper p-4">
        <h3 className="text-sm font-semibold">{copy.bankDetails}</h3>
        {bankConfigured ? (
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
        chooseText={copy.chooseProof}
        disabled={disabled}
        error={error}
        file={proofFile}
        hint={copy.proofHint}
        inputKey={`proof-${inputVersion}`}
        label={copy.proofLabel}
        onChange={onProofChange}
      />
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

function StatePanel({ booking, copy }) {
  return (
    <section className="flat-panel space-y-3">
      <h2 className="font-display text-3xl font-semibold">
        {copy.statuses[booking.status] || booking.status}
      </h2>
      <p className="text-sm leading-relaxed text-muted">
        {copy.stateBodies[booking.status]}
      </p>
    </section>
  );
}

function AllSetPanel({ canDownloadFinal, copy, token }) {
  return (
    <section className="flat-panel space-y-4">
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
    </section>
  );
}

function BookingDetails({ booking, copy, lang }) {
  return (
    <aside className="flat-panel h-fit space-y-4">
      <h2 className="font-display text-2xl font-semibold">{copy.summaryTitle}</h2>
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
        label={copy.paymentMethod}
        value={paymentMethodText(booking.payment_method, copy)}
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
