import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const COPY = {
  de: {
    pageTitle: "Buchungsstatus | RoKo Bar",
    eyebrow: "Privater Buchungslink",
    title: "Deine RoKo-Bar Buchung",
    intro:
      "Hier kannst du den Vertrag herunterladen, den unterschriebenen Vertrag hochladen und spaeter den gegengezeichneten Vertrag abrufen.",
    loading: "Buchung wird geladen...",
    notFound: "Dieser private Link ist nicht gueltig oder nicht mehr aktiv.",
    genericError: "Die Buchung konnte nicht geladen werden.",
    retry: "Erneut laden",
    date: "Termin",
    rent: "Miete",
    deposit: "Kaution",
    depositSuffix: "bar",
    contract: "Vertrag",
    deadline: "Frist",
    missingDeadline: "Nicht gesetzt",
    signedUploaded: "Unterschriebener Vertrag hochgeladen",
    finalUploaded: "Gegengezeichneter Vertrag bereit",
    yes: "Ja",
    no: "Nein",
    downloadContract: "Vertrag herunterladen",
    downloadRules: "Hausordnung herunterladen",
    downloadFinal: "Finalen Vertrag herunterladen",
    uploadTitle: "Unterschriebenen Vertrag hochladen",
    replaceUploadTitle: "PDF ersetzen",
    uploadHint: "Nur PDF, maximal 4 MB.",
    chooseFile: "PDF auswaehlen",
    uploadButton: "Hochladen",
    uploading: "Wird hochgeladen...",
    uploadSuccess: "Danke, der unterschriebene Vertrag ist hochgeladen.",
    uploadNeedsFile: "Bitte waehle eine PDF-Datei aus.",
    uploadTypeError: "Bitte lade eine PDF-Datei hoch.",
    uploadSizeError: "Die PDF-Datei darf maximal 4 MB gross sein.",
    uploadNetworkError: "Der Upload ist fehlgeschlagen.",
    cashNote: "Bitte bringe 200 EUR Kaution bar zur Uebergabe mit.",
    statuses: {
      pending: "In Pruefung",
      approved: "Freigegeben",
      signed: "Hochgeladen",
      confirmed: "Bestaetigt",
      rejected: "Abgelehnt",
      cancelled: "Storniert",
      expired: "Abgelaufen",
    },
    state: {
      pending: {
        title: "Noch in Pruefung",
        body:
          "Diese Anfrage ist noch nicht freigegeben. Du bekommst eine E-Mail, sobald ein:e Tutor:in sie geprueft hat.",
      },
      approved: {
        title: "Freigegeben: Bitte unterschreiben",
        body:
          "Lade Vertrag und Hausordnung herunter, unterschreibe den Vertrag und lade ihn hier als PDF wieder hoch. Noch ist nichts final.",
      },
      signed: {
        title: "Vertrag ist angekommen",
        body:
          "Wir pruefen den Upload und zeichnen den Vertrag gegen. Du musst nichts weiter tun, kannst die PDF aber bis zur Bestaetigung ersetzen.",
      },
      confirmed: {
        title: "Alles bereit",
        body:
          "Der gegengezeichnete Vertrag ist verfuegbar. Deine Buchung ist bestaetigt.",
      },
      rejected: {
        title: "Leider abgelehnt",
        body:
          "Diese Anfrage wurde abgelehnt. Wenn etwas unklar ist, antworte bitte auf die E-Mail der Bar-Tutor:innen.",
      },
      cancelled: {
        title: "Buchung storniert",
        body:
          "Diese Buchung wurde storniert. Wenn das nicht stimmen sollte, melde dich bitte bei den Bar-Tutor:innen.",
      },
      expired: {
        title: "Frist abgelaufen",
        body:
          "Die Upload-Frist fuer diesen Vertrag ist abgelaufen. Bitte melde dich bei den Bar-Tutor:innen, falls du den Termin noch brauchst.",
      },
    },
  },
  en: {
    pageTitle: "Booking status | RoKo Bar",
    eyebrow: "Private booking link",
    title: "Your RoKo Bar booking",
    intro:
      "Use this page to download the contract, upload the signed PDF, and later download the counter-signed contract.",
    loading: "Loading booking...",
    notFound: "This private link is not valid or no longer active.",
    genericError: "Could not load the booking.",
    retry: "Try again",
    date: "Date",
    rent: "Rent",
    deposit: "Deposit",
    depositSuffix: "cash",
    contract: "Contract",
    deadline: "Deadline",
    missingDeadline: "Not set",
    signedUploaded: "Signed contract uploaded",
    finalUploaded: "Counter-signed contract ready",
    yes: "Yes",
    no: "No",
    downloadContract: "Download contract",
    downloadRules: "Download house rules",
    downloadFinal: "Download final contract",
    uploadTitle: "Upload signed contract",
    replaceUploadTitle: "Replace PDF",
    uploadHint: "PDF only, up to 4 MB.",
    chooseFile: "Choose PDF",
    uploadButton: "Upload",
    uploading: "Uploading...",
    uploadSuccess: "Thanks, the signed contract has been uploaded.",
    uploadNeedsFile: "Please choose a PDF file.",
    uploadTypeError: "Please upload a PDF file.",
    uploadSizeError: "The PDF file must be 4 MB or smaller.",
    uploadNetworkError: "Upload failed.",
    cashNote: "Please bring the 200 EUR deposit in cash to handover.",
    statuses: {
      pending: "In review",
      approved: "Approved",
      signed: "Uploaded",
      confirmed: "Confirmed",
      rejected: "Rejected",
      cancelled: "Cancelled",
      expired: "Expired",
    },
    state: {
      pending: {
        title: "Still in review",
        body:
          "This request has not been approved yet. You will receive an email once a tutor has reviewed it.",
      },
      approved: {
        title: "Approved: please sign",
        body:
          "Download the contract and house rules, sign the contract, and upload it here as a PDF. Nothing is final yet.",
      },
      signed: {
        title: "We received the contract",
        body:
          "We will review the upload and counter-sign the contract. Nothing else is needed, but you can replace the PDF until confirmation.",
      },
      confirmed: {
        title: "You are all set",
        body:
          "The counter-signed contract is available. Your booking is confirmed.",
      },
      rejected: {
        title: "Request rejected",
        body:
          "This request was rejected. If anything is unclear, please reply to the bar tutors' email.",
      },
      cancelled: {
        title: "Booking cancelled",
        body:
          "This booking was cancelled. If this does not look right, please contact the bar tutors.",
      },
      expired: {
        title: "Deadline expired",
        body:
          "The upload deadline for this contract has passed. Please contact the bar tutors if you still need the date.",
      },
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
  if (status === "confirmed" || status === "signed") {
    return "border-success bg-surface text-success";
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

async function readJsonOrText(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.trim().slice(0, 280) };
  }
}

export default function BookingStatus() {
  const { token = "" } = useParams();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.de;
  const [booking, setBooking] = useState(null);
  const [loadStatus, setLoadStatus] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMessage, setUploadMessage] = useState(null);

  const loadBooking = useCallback(async () => {
    setLoadStatus("loading");
    setLoadError("");

    try {
      const response = await fetch(
        `/api/booking/status?token=${encodeURIComponent(token)}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await readJsonOrText(response);

      if (!response.ok) {
        setLoadStatus("error");
        setLoadError(response.status === 404 ? copy.notFound : data.error || copy.genericError);
        return;
      }

      setBooking(data.booking);
      setLoadStatus("ready");
    } catch {
      setLoadStatus("error");
      setLoadError(copy.genericError);
    }
  }, [copy.genericError, copy.notFound, token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadBooking();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBooking]);

  const stateCopy = useMemo(() => {
    const status = booking?.status || "pending";
    return copy.state[status] || copy.state.pending;
  }, [booking?.status, copy.state]);

  const canDownloadBlankFiles =
    booking?.status === "approved" ||
    booking?.status === "signed" ||
    booking?.status === "confirmed";
  const canUpload = booking?.status === "approved" || booking?.status === "signed";
  const canDownloadFinal = booking?.status === "confirmed" && booking.hasFinalContract;
  const busy = uploadStatus === "uploading";

  const onFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setUploadMessage(null);
  };

  const uploadSignedContract = async (event) => {
    event.preventDefault();
    setUploadMessage(null);

    if (!file) {
      setUploadMessage({ type: "error", text: copy.uploadNeedsFile });
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      setUploadMessage({ type: "error", text: copy.uploadTypeError });
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadMessage({ type: "error", text: copy.uploadTypeError });
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadMessage({ type: "error", text: copy.uploadSizeError });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploadStatus("uploading");

    try {
      const response = await fetch(
        `/api/booking/upload?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        }
      );
      const data = await readJsonOrText(response);

      if (!response.ok) {
        setUploadStatus("idle");
        setUploadMessage({
          type: "error",
          text: data.error || copy.uploadNetworkError,
        });
        if (response.status === 409) {
          await loadBooking();
        }
        return;
      }

      setBooking(data.booking);
      setFile(null);
      setUploadStatus("idle");
      setUploadMessage({ type: "success", text: copy.uploadSuccess });
      event.currentTarget.reset();
    } catch {
      setUploadStatus("idle");
      setUploadMessage({ type: "error", text: copy.uploadNetworkError });
    }
  };

  return (
    <>
      <Helmet>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <section className="editorial-section section-paper border-t-0 py-12 md:py-16">
        <div className="container-wide max-w-5xl select-text space-y-8">
          <header className="max-w-3xl space-y-3">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">
              {copy.title}
            </h1>
            <p className="lead text-base">{copy.intro}</p>
          </header>

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
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flat-panel space-y-6">
                <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="font-display text-3xl font-semibold">
                      {stateCopy.title}
                    </h2>
                    <p className="text-muted">{stateCopy.body}</p>
                  </div>
                  <span
                    className={[
                      "inline-flex w-fit border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em]",
                      statusClass(booking.status),
                    ].join(" ")}
                  >
                    {copy.statuses[booking.status] || booking.status}
                  </span>
                </div>

                {canDownloadBlankFiles ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <a className="btn-primary w-full sm:w-auto" href={fileUrl(token, "contract")}>
                      {copy.downloadContract}
                    </a>
                    <a className="btn-secondary w-full sm:w-auto" href={fileUrl(token, "rules")}>
                      {copy.downloadRules}
                    </a>
                  </div>
                ) : null}

                {canDownloadFinal ? (
                  <div className="space-y-3 border-t border-line pt-5">
                    <a className="btn-primary w-full sm:w-auto" href={fileUrl(token, "final")}>
                      {copy.downloadFinal}
                    </a>
                    <p className="text-sm font-semibold text-success">{copy.cashNote}</p>
                  </div>
                ) : null}

                {canUpload ? (
                  <form
                    className="space-y-4 border-t border-line pt-5"
                    onSubmit={uploadSignedContract}
                  >
                    <div className="space-y-1">
                      <h3 className="font-display text-2xl font-semibold">
                        {booking.status === "signed"
                          ? copy.replaceUploadTitle
                          : copy.uploadTitle}
                      </h3>
                      <p className="text-sm text-muted">{copy.uploadHint}</p>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                        {copy.chooseFile}
                      </span>
                      <input
                        accept="application/pdf,.pdf"
                        className="form-input w-full px-3 py-2"
                        disabled={busy}
                        onChange={onFileChange}
                        type="file"
                      />
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <button className="btn-primary w-full sm:w-auto" disabled={busy} type="submit">
                        {busy ? copy.uploading : copy.uploadButton}
                      </button>
                      <UploadNotice message={uploadMessage} />
                    </div>
                  </form>
                ) : null}
              </div>

              <aside className="flat-panel h-fit space-y-4">
                <DetailRow
                  label={copy.date}
                  value={formatNight(booking.night, lang)}
                />
                <DetailRow label={copy.rent} value={formatMoney(booking.price, lang)} />
                <DetailRow
                  label={copy.deposit}
                  value={`${formatMoney(booking.deposit, lang)} ${copy.depositSuffix}`}
                />
                <DetailRow label={copy.contract} value={booking.contract.label} />
                <DetailRow
                  label={copy.deadline}
                  value={formatDateTime(
                    booking.confirm_deadline,
                    lang,
                    copy.missingDeadline
                  )}
                />
                <DetailRow
                  label={copy.signedUploaded}
                  value={booking.hasSignedContract ? copy.yes : copy.no}
                />
                <DetailRow
                  label={copy.finalUploaded}
                  value={booking.hasFinalContract ? copy.yes : copy.no}
                />
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </>
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

function UploadNotice({ message }) {
  if (!message) return null;

  const isError = message.type === "error";

  return (
    <span
      className={[
        "text-sm font-semibold",
        isError ? "text-danger" : "text-success",
      ].join(" ")}
      role={isError ? "alert" : "status"}
    >
      {message.text}
    </span>
  );
}
