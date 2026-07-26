import { Fragment, useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ConfirmModal from "../components/ConfirmModal.jsx";
import FilePreviewModal from "../components/FilePreviewModal.jsx";
import { useLanguage } from "../context/useLanguage.js";

const SESSION_KEY = "roko-admin-session";
const EMPTY_BLOCK_FORM = { night: "", reason: "" };
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const COPY = {
  de: {
    pageTitle: "Admin | RoKo Bar",
    notSet: "Nicht gesetzt",
    admin: "Admin",
    loginTitle: "RoKo Bar Verwaltung",
    loginIntro: "Anmeldung für Tutorinnen und Tutoren.",
    password: "Passwort",
    checking: "Prüfe ...",
    login: "Anmelden",
    dashboardTitle: "Buchungsverwaltung",
    sessionUntil: "Sitzung gültig bis {date}",
    refresh: "Aktualisieren",
    logout: "Abmelden",
    language: "Sprache",
    loadingBookings: "Buchungen werden geladen...",
    noBookings: "Keine Buchungen in diesem Filter.",
    sessionExpired: "Die Sitzung ist abgelaufen. Bitte neu anmelden.",
    loginSuccess: "Angemeldet.",
    badPassword: "Das Passwort stimmt nicht.",
    genericRequestError: "Die Anfrage ist fehlgeschlagen.",
    editSaved: "Buchung aktualisiert.",
    blockedSaved: "Datum gesperrt.",
    blockedRemoved: "Sperre entfernt.",
    needsFridaySaturday: "Bitte einen Freitag oder Samstag auswählen.",
    fileMissing: "Bitte eine PDF-Datei auswählen.",
    fileType: "Bitte eine PDF-Datei hochladen.",
    fileSize: "Die PDF-Datei darf maximal 4 MB groß sein.",
    countersignSaved: "Gegengezeichneter Vertrag gespeichert.",
    downloadStarted: "Download vorbereitet.",
    confirms: {
      reject: "Diese Anfrage ablehnen?",
      cancel: "Diese Buchung stornieren?",
      redo: "Erneute Abgabe anfordern? Vorhandene Uploads werden entfernt.",
      unblock: "{date} freigeben?",
    },
    actionSaved: {
      approve: "Freigabe gespeichert.",
      reject: "Ablehnung gespeichert.",
      cancel: "Storno gespeichert.",
      redo: "Erneute Abgabe angefordert.",
    },
    filters: [
      { value: "pending", label: "Ausstehend" },
      { value: "approved", label: "Freigegeben" },
      { value: "signed", label: "Eingereicht" },
      { value: "confirmed", label: "Bestätigt" },
      { value: "expired", label: "Abgelaufen" },
      { value: "all", label: "Alle" },
    ],
    statuses: {
      pending: "Ausstehend",
      approved: "Freigegeben",
      signed: "Eingereicht",
      confirmed: "Bestätigt",
      rejected: "Abgelehnt",
      cancelled: "Storniert",
      expired: "Abgelaufen",
    },
    residencies: {
      roko: "RoKo",
      christophorusweg: "Christophorusweg",
      rosenbachweg: "Rosenbachweg",
      external: "Extern",
    },
    table: {
      date: "Datum",
      name: "Name",
      contact: "Kontakt",
      rate: "Tarif",
      guests: "Gäste",
      status: "Status",
      contract: "Vertrag",
      payment: "Zahlung",
      created: "Erstellt",
      actions: "Aktionen",
      deadline: "Frist",
      noPhone: "Kein Telefon",
      openGuests: "Offen",
    },
    payment: {
      rent: "Miete",
      deposit: "Kaution",
      method: "Mietzahlung",
      cash: "Bar",
      online: "Online",
      methodMissing: "Nicht gewählt",
      paid: "bezahlt",
      open: "offen",
      proofUploaded: "Nachweis hochgeladen",
      proofAwaiting: "Nachweis fehlt",
      proofNotNeeded: "Kein Nachweis nötig",
      proofRequired:
        "Online-Zahlungsnachweis muss hochgeladen sein, bevor gegengezeichnet werden kann.",
      methodRequired:
        "Zahlungsart für die Miete muss gewählt sein, bevor gegengezeichnet werden kann.",
      rentRequired: "Markiere die Miete als bezahlt, bevor du gegenzeichnest.",
      markRent: "Miete bezahlt markieren",
      unmarkRent: "Miete offen markieren",
      markDeposit: "Kaution bezahlt markieren",
      unmarkDeposit: "Kaution offen markieren",
      prompt: "Optionale Zahlungsnotiz für {label}",
      rentNoteLabel: "Notiz zur Miete",
      depositNoteLabel: "Notiz zur Kaution",
      beforeCountersign: "Vor dem Gegenzeichnen",
      checkMethod: "Zahlungsart gewählt",
      checkProof: "Zahlungsnachweis hochgeladen",
      checkRent: "Miete als bezahlt markiert",
      saved: "{label} aktualisiert.",
    },
    contractStates: {
      none: "Noch kein Vertrag",
      waiting: "Wartet auf Upload",
      signed: "Unterschrieben hochgeladen",
      final: "Gegengezeichnet",
      closed: "Geschlossen",
    },
    actions: {
      approve: "Freigeben",
      reject: "Ablehnen",
      cancel: "Stornieren",
      edit: "Bearbeiten",
      details: "Details",
      close: "Schließen",
      save: "Speichern",
      abort: "Abbrechen",
      requestRedo: "Neu anfordern",
      downloadSigned: "Unterschriebene PDF",
      downloadFinal: "Finale PDF",
      downloadProof: "Zahlungsnachweis",
      countersign: "Gegenzeichnen",
      countersigning: "Lädt hoch ...",
      chooseFinal: "Finale PDF auswählen",
      remove: "Entfernen",
      block: "Sperren",
    },
    details: {
      address: "Adresse",
      additionalInfo: "Weitere Infos",
      internalNotes: "Interne Notizen",
      bookingId: "Buchungs-ID",
      accessToken: "Access Token",
      paymentNote: "Zahlungsnotiz",
      language: "E-Mail-Sprache",
      reviewed: "Geprüft",
      rentPaidAt: "Miete bezahlt am",
      depositPaidAt: "Kaution bezahlt am",
      signedAt: "Gegengezeichnet am",
      notProvided: "Nicht angegeben",
      noInternalNotes: "Keine internen Notizen",
      noPaymentNote: "Keine Notiz",
      signedPath: "Unterschriebene PDF gespeichert",
      finalPath: "Finale PDF gespeichert",
      yes: "Ja",
      no: "Nein",
      contractWork: "Vertragsablauf",
      uploadHint: "Nur PDF, maximal 4 MB. Beim Hochladen wird die Buchung bestätigt.",
      groups: {
        contact: "Kontakt & Veranstaltung",
        timeline: "Verlauf",
        system: "System & Notizen",
      },
      showTechnical: "Technische Details anzeigen",
      hideTechnical: "Technische Details ausblenden",
    },
    edit: {
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      rate: "Tarif",
      guests: "Gästezahl",
      address: "Adresse",
      additionalInfo: "Weitere Infos",
      internalNotes: "Interne Notizen",
    },
    blocked: {
      eyebrow: "Kalender",
      title: "Gesperrte Termine",
      date: "Datum",
      reason: "Grund",
      created: "Erstellt",
      action: "Aktion",
      reasonPlaceholder: "Interne Veranstaltung, Wartung...",
      empty: "Keine gesperrten Termine.",
      noReason: "Kein Grund",
    },
  },
  en: {
    pageTitle: "Admin | RoKo Bar",
    notSet: "Not set",
    admin: "Admin",
    loginTitle: "RoKo Bar admin",
    loginIntro: "Login for bar tutors.",
    password: "Password",
    checking: "Checking...",
    login: "Log in",
    dashboardTitle: "Booking admin",
    sessionUntil: "Session valid until {date}",
    refresh: "Refresh",
    logout: "Log out",
    language: "Language",
    loadingBookings: "Loading bookings...",
    noBookings: "No bookings in this filter.",
    sessionExpired: "The session has expired. Please log in again.",
    loginSuccess: "Logged in.",
    badPassword: "The password is not correct.",
    genericRequestError: "The request failed.",
    editSaved: "Booking updated.",
    blockedSaved: "Date blocked.",
    blockedRemoved: "Block removed.",
    needsFridaySaturday: "Please choose a Friday or Saturday.",
    fileMissing: "Please choose a PDF file.",
    fileType: "Please upload a PDF file.",
    fileSize: "The PDF file must be 4 MB or smaller.",
    countersignSaved: "Counter-signed contract saved.",
    downloadStarted: "Download prepared.",
    confirms: {
      reject: "Reject this request?",
      cancel: "Cancel this booking?",
      redo: "Request a redo? Existing uploads will be removed.",
      unblock: "Release {date}?",
    },
    actionSaved: {
      approve: "Approval saved.",
      reject: "Rejection saved.",
      cancel: "Cancellation saved.",
      redo: "Redo requested.",
    },
    filters: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "signed", label: "Submitted" },
      { value: "confirmed", label: "Confirmed" },
      { value: "expired", label: "Expired" },
      { value: "all", label: "All" },
    ],
    statuses: {
      pending: "Pending",
      approved: "Approved",
      signed: "Submitted",
      confirmed: "Confirmed",
      rejected: "Rejected",
      cancelled: "Cancelled",
      expired: "Expired",
    },
    residencies: {
      roko: "RoKo",
      christophorusweg: "Christophorusweg",
      rosenbachweg: "Rosenbachweg",
      external: "External",
    },
    table: {
      date: "Date",
      name: "Name",
      contact: "Contact",
      rate: "Rate",
      guests: "Guests",
      status: "Status",
      contract: "Contract",
      payment: "Payment",
      created: "Created",
      actions: "Actions",
      deadline: "Deadline",
      noPhone: "No phone",
      openGuests: "Open",
    },
    payment: {
      rent: "Rent",
      deposit: "Deposit",
      method: "Rent payment",
      cash: "Cash",
      online: "Online",
      methodMissing: "Not selected",
      paid: "paid",
      open: "open",
      proofUploaded: "Proof uploaded",
      proofAwaiting: "Awaiting proof",
      proofNotNeeded: "No proof needed",
      proofRequired:
        "Online payment proof must be uploaded before this booking can be counter-signed.",
      methodRequired:
        "Rent payment method must be selected before this booking can be counter-signed.",
      rentRequired: "Mark rent as paid before counter-signing.",
      markRent: "Mark rent paid",
      unmarkRent: "Mark rent open",
      markDeposit: "Mark deposit paid",
      unmarkDeposit: "Mark deposit open",
      prompt: "Optional payment note for {label}",
      rentNoteLabel: "Rent note",
      depositNoteLabel: "Deposit note",
      beforeCountersign: "Before counter-signing",
      checkMethod: "Payment method selected",
      checkProof: "Payment proof uploaded",
      checkRent: "Rent marked as paid",
      saved: "{label} updated.",
    },
    contractStates: {
      none: "No contract yet",
      waiting: "Waiting for upload",
      signed: "Signed uploaded",
      final: "Counter-signed",
      closed: "Closed",
    },
    actions: {
      approve: "Approve",
      reject: "Reject",
      cancel: "Cancel",
      edit: "Edit",
      details: "Details",
      close: "Close",
      save: "Save",
      abort: "Cancel",
      requestRedo: "Request redo",
      downloadSigned: "Signed PDF",
      downloadFinal: "Final PDF",
      downloadProof: "Payment proof",
      countersign: "Counter-sign",
      countersigning: "Uploading...",
      chooseFinal: "Choose final PDF",
      remove: "Remove",
      block: "Block",
    },
    details: {
      address: "Address",
      additionalInfo: "Additional info",
      internalNotes: "Internal notes",
      bookingId: "Booking ID",
      accessToken: "Access token",
      paymentNote: "Payment note",
      language: "Email language",
      reviewed: "Reviewed",
      rentPaidAt: "Rent paid at",
      depositPaidAt: "Deposit paid at",
      signedAt: "Counter-signed at",
      notProvided: "Not provided",
      noInternalNotes: "No internal notes",
      noPaymentNote: "No note",
      signedPath: "Signed PDF stored",
      finalPath: "Final PDF stored",
      yes: "Yes",
      no: "No",
      contractWork: "Contract workflow",
      uploadHint: "PDF only, up to 4 MB. Uploading confirms the booking.",
      groups: {
        contact: "Contact & event",
        timeline: "Timeline",
        system: "System & notes",
      },
      showTechnical: "Show technical details",
      hideTechnical: "Hide technical details",
    },
    edit: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      rate: "Rate",
      guests: "Guest count",
      address: "Address",
      additionalInfo: "Additional info",
      internalNotes: "Internal notes",
    },
    blocked: {
      eyebrow: "Calendar",
      title: "Blocked dates",
      date: "Date",
      reason: "Reason",
      created: "Created",
      action: "Action",
      reasonPlaceholder: "Internal event, maintenance...",
      empty: "No blocked dates.",
      noReason: "No reason",
    },
  },
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readStoredSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { expired: false, session: null };

    const session = JSON.parse(raw);
    if (
      !session?.token ||
      !session?.expiresAt ||
      new Date(session.expiresAt).getTime() <= Date.now()
    ) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return { expired: true, session: null };
    }

    return { expired: false, session };
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return { expired: true, session: null };
  }
}

function storeSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

function clientLanguage() {
  if (typeof window === "undefined") return "de";
  return window.localStorage.getItem("roko-language") === "en" ? "en" : "de";
}

async function apiRequest(path, { token, method = "GET", body } = {}) {
  const lang = clientLanguage();
  const headers = {
    Accept: "application/json",
    "Accept-Language": lang,
    "X-Roko-Lang": lang,
  };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (method === "GET") {
    headers["Cache-Control"] = "no-cache, no-store, max-age=0";
    headers.Pragma = "no-cache";
  }

  const response = await fetch(path, {
    method,
    headers,
    ...(method === "GET" ? { cache: "no-store" } : {}),
    body:
      body === undefined || isFormData
        ? body
        : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error || (lang === "en" ? "The request failed." : "Die Anfrage ist fehlgeschlagen."),
      response.status
    );
  }

  return data;
}

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

function toIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tomorrowIso() {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return toIsoDate(tomorrow);
}

function isFridayOrSaturday(iso) {
  const date = parseIsoDate(iso);
  if (!date) return false;

  const weekday = date.getUTCDay();
  return weekday === 5 || weekday === 6;
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
  }).format(date);
}

function formatMoney(value, lang) {
  return new Intl.NumberFormat(lang === "en" ? "en-GB" : "de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function paymentMethodText(booking, copy) {
  if (booking.payment_method === "cash") return copy.payment.cash;
  if (booking.payment_method === "online") return copy.payment.online;
  return copy.payment.methodMissing;
}

function paymentProofText(booking, copy) {
  if (booking.payment_method !== "online") return copy.payment.proofNotNeeded;
  return booking.rent_proof_path
    ? copy.payment.proofUploaded
    : copy.payment.proofAwaiting;
}

function bookingMatchesFilter(booking, filter) {
  if (filter === "all") return true;
  if (filter === "expired") return Boolean(booking.isExpired);
  if (filter === "approved") {
    return booking.status === "approved" && !booking.isExpired;
  }
  return booking.status === filter;
}

function statusText(booking, copy) {
  if (booking.isExpired) return copy.statuses.expired;
  return copy.statuses[booking.status] || booking.status;
}

function statusClass(booking) {
  if (booking.isExpired) {
    return "border-danger bg-brick-tint text-danger";
  }

  if (booking.status === "confirmed" || booking.status === "signed") {
    return "border-success bg-surface text-success";
  }

  if (booking.status === "approved") {
    return "border-warning bg-surface text-warning";
  }

  if (booking.status === "rejected" || booking.status === "cancelled") {
    return "border-line bg-paper text-muted";
  }

  return "border-primary bg-brick-tint text-primary-dark";
}

// Left-edge accent so each row's status is scannable at a glance.
function statusAccentClass(booking) {
  if (booking.isExpired) return "border-l-danger";
  if (booking.status === "confirmed" || booking.status === "signed") {
    return "border-l-success";
  }
  if (booking.status === "approved") return "border-l-warning";
  if (booking.status === "rejected" || booking.status === "cancelled") {
    return "border-l-muted";
  }
  return "border-l-sky";
}

function compactButtonClass(variant = "secondary") {
  const base =
    "inline-flex min-h-11 items-center justify-center border px-3 py-2 text-xs font-semibold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-55";

  if (variant === "primary") {
    return `${base} border-primary bg-primary text-surface hover:bg-primary-hover`;
  }

  if (variant === "danger") {
    return `${base} border-danger bg-surface text-danger hover:bg-brick-tint`;
  }

  if (variant === "ghost") {
    return `${base} border-transparent bg-transparent text-primary hover:bg-brick-tint`;
  }

  if (variant === "sky") {
    return `${base} border-sky bg-surface text-sky hover:bg-sky hover:text-surface`;
  }

  return `${base} border-line bg-surface text-ink hover:border-primary hover:text-primary`;
}

function makeEditForm(booking) {
  return {
    requester_name: booking.requester_name || "",
    email: booking.email || "",
    phone: booking.phone || "",
    address: booking.address || "",
    residency: booking.residency || "external",
    guest_count: booking.guest_count ?? "",
    additional_info: booking.additional_info || "",
    internal_notes: booking.internal_notes || "",
  };
}

function normalizeEditPayload(form) {
  return {
    requester_name: form.requester_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    residency: form.residency,
    guest_count: form.guest_count === "" ? null : Number(form.guest_count),
    additional_info: form.additional_info.trim(),
    internal_notes: form.internal_notes.trim(),
  };
}

function isPdfFile(file) {
  return (
    file &&
    (!file.type || file.type === "application/pdf") &&
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function openSignedUrl(url) {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function previewKind(storagePath) {
  const path = String(storagePath || "").split(/[?#]/)[0].toLowerCase();
  return path.endsWith(".pdf") ? "pdf" : "image";
}

export default function Admin() {
  const { lang, setLang, t } = useLanguage();
  const copy = {
    ...(COPY[lang] || COPY.de),
    approvalEmail: t.admin.approvalEmail,
    confirmations: t.admin.confirmations,
    filePreview: t.admin.filePreview,
    tutor: t.admin.tutor,
  };
  const [storedSession] = useState(() => readStoredSession());
  const [session, setSession] = useState(storedSession.session);
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("idle");
  const [filter, setFilter] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [failedApprovalEmailIds, setFailedApprovalEmailIds] = useState(
    () => new Set()
  );
  const [blockedDates, setBlockedDates] = useState([]);
  const [loadStatus, setLoadStatus] = useState("idle");
  const [notice, setNotice] = useState(() =>
    storedSession.expired ? { type: "error", text: copy.sessionExpired } : null
  );
  const [busyKey, setBusyKey] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [blockForm, setBlockForm] = useState(EMPTY_BLOCK_FORM);
  const [confirmation, setConfirmation] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [tutorNames, setTutorNames] = useState([]);
  const [tutorLoadError, setTutorLoadError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const token = session?.token;

  const applyBookingResponse = useCallback(
    (booking) => {
      if (!booking?.id) return;

      setBookings((current) => {
        const matches = bookingMatchesFilter(booking, filter);
        const exists = current.some((item) => item.id === booking.id);

        if (!matches) return current.filter((item) => item.id !== booking.id);
        if (!exists) return [booking, ...current];
        return current.map((item) => (item.id === booking.id ? booking : item));
      });
    },
    [filter],
  );

  const closeConfirmation = () => {
    if (!busyKey) {
      setConfirmation(null);
      setSelectedTutor("");
      setPaymentNote("");
    }
  };

  const confirmAction = async () => {
    if (!confirmation || busyKey) return;
    if (confirmation.kind === "assignTutor") {
      await assignTutor(confirmation.booking, selectedTutor);
    } else if (confirmation.kind === "payment") {
      await markPayment(confirmation.booking, confirmation.field, paymentNote.trim());
    } else {
      await confirmation.onConfirm();
    }
    setConfirmation(null);
    setSelectedTutor("");
    setPaymentNote("");
  };

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setPassword("");
    setBookings([]);
    setFailedApprovalEmailIds(new Set());
    setBlockedDates([]);
    setExpandedId(null);
    setEditId(null);
    setEditForm(null);
    setConfirmation(null);
    setFilePreview(null);
    setTutorNames([]);
    setTutorLoadError(null);
    setSelectedTutor("");
    setNotice(null);
  }, []);

  const handleApiError = useCallback(
    (error) => {
      if (error.status === 401) {
        logout();
        setNotice({
          type: "error",
          text: copy.sessionExpired,
        });
        return true;
      }

      return false;
    },
    [copy.sessionExpired, logout]
  );

  const refreshDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      if (!silent) setLoadStatus("loading");

      try {
        const statusQuery = filter === "all" ? "" : `?status=${filter}`;
        const [bookingData, blockedData] = await Promise.all([
          apiRequest(`/api/admin/bookings${statusQuery}`, { token }),
          apiRequest("/api/admin/blocked", { token }),
        ]);

        setBookings(Array.isArray(bookingData.bookings) ? bookingData.bookings : []);
        setBlockedDates(Array.isArray(blockedData.blocked) ? blockedData.blocked : []);
        setLoadStatus("ready");
      } catch (error) {
        if (!handleApiError(error)) {
          setLoadStatus("error");
          setNotice({ type: "error", text: error.message });
        }
      }
    },
    [filter, handleApiError, token]
  );

  useEffect(() => {
    if (token) {
      refreshDashboard();
    }
  }, [refreshDashboard, token]);

  useEffect(() => {
    let cancelled = false;

    if (!token) return undefined;

    setTutorLoadError(null);
    apiRequest("/api/admin/tutors", { token })
      .then((data) => {
        if (cancelled) return;
        setTutorNames(Array.isArray(data.tutors) ? data.tutors : []);
      })
      .catch((error) => {
        if (cancelled || handleApiError(error)) return;
        setTutorNames([]);
        setTutorLoadError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [handleApiError, token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginStatus("loading");
    setNotice(null);

    try {
      const data = await apiRequest("/api/admin/login", {
        method: "POST",
        body: { password },
      });
      const nextSession = { token: data.token, expiresAt: data.expiresAt };

      storeSession(nextSession);
      setSession(nextSession);
      setPassword("");
      setLoginStatus("idle");
      setNotice({ type: "success", text: copy.loginSuccess });
    } catch (error) {
      setLoginStatus("idle");
      setNotice({
        type: "error",
        text: error.status === 401 ? copy.badPassword : error.message,
      });
    }
  };

  const runBookingAction = async (booking, action) => {
    setBusyKey(`${action}:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(`/api/admin/bookings/${booking.id}/${action}`, {
        token,
        method: "POST",
      });

      if (action === "approve" && data.email?.sent === false) {
        setFailedApprovalEmailIds((current) => {
          const next = new Set(current);
          next.add(booking.id);
          return next;
        });
        setNotice({
          type: "error",
          text: copy.approvalEmail.approvedButFailed,
        });
      } else {
        setNotice({ type: "success", text: copy.actionSaved[action] });
      }
      applyBookingResponse(data.booking);
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const requestBookingAction = (booking, action) => {
    if (action === "approve") {
      if (!booking.assigned_tutor) {
        setNotice({ type: "error", text: copy.tutor.assignFirst });
        return;
      }
      runBookingAction(booking, action);
      return;
    }

    const label =
      action === "redo" ? copy.actions.requestRedo : copy.actions[action];
    const message =
      action === "cancel" && booking.status === "confirmed"
        ? copy.confirmations.cancelConfirmed
        : copy.confirmations[action];
    setConfirmation({
      title: label,
      message,
      confirmLabel: label,
      tone: "danger",
      onConfirm: () => runBookingAction(booking, action),
    });
  };

  const resendApprovalEmail = async (booking) => {
    setBusyKey(`resend-approval:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(
        `/api/admin/bookings/${booking.id}/resend-approval`,
        {
          token,
          method: "POST",
        }
      );

      if (data.email?.sent) {
        setFailedApprovalEmailIds((current) => {
          const next = new Set(current);
          next.delete(booking.id);
          return next;
        });
        setNotice({ type: "success", text: copy.approvalEmail.sent });
      } else {
        setFailedApprovalEmailIds((current) => {
          const next = new Set(current);
          next.add(booking.id);
          return next;
        });
        setNotice({ type: "error", text: copy.approvalEmail.failed });
      }
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const assignTutor = async (booking, tutor) => {
    setBusyKey(`assign:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(`/api/admin/bookings/${booking.id}/assign`, {
        token,
        method: "POST",
        body: { tutor },
      });

      applyBookingResponse(data.booking);
      setNotice({
        type: data.email?.sent ? "success" : "error",
        text: data.email?.sent ? copy.tutor.emailSent : copy.tutor.emailFailed,
      });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const requestTutorAssignment = (booking) => {
    if (tutorNames.length === 0) {
      setNotice({
        type: "error",
        text: tutorLoadError || copy.tutor.unavailable,
      });
      return;
    }

    setSelectedTutor(
      tutorNames.includes(booking.assigned_tutor)
        ? booking.assigned_tutor
        : tutorNames[0],
    );
    setConfirmation({
      kind: "assignTutor",
      booking,
      title: copy.tutor.modalTitle,
      message: copy.tutor.modalMessage,
      confirmLabel: copy.tutor.assignAction,
      tone: "default",
    });
  };

  const markPayment = async (booking, field, note) => {
    const isRent = field === "rent_paid";
    const label = isRent ? copy.payment.rent : copy.payment.deposit;
    const noteField = isRent ? "rent_note" : "deposit_note";
    const nextValue = !booking[field];

    setBusyKey(`${field}:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(`/api/admin/bookings/${booking.id}/payment`, {
        token,
        method: "POST",
        body: {
          [field]: nextValue,
          [noteField]: note,
        },
      });
      setNotice({
        type: "success",
        text: copy.payment.saved.replace("{label}", label),
      });
      applyBookingResponse(data.booking);
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const requestPaymentChange = (booking, field) => {
    const isRent = field === "rent_paid";
    const nextValue = !booking[field];
    const confirmLabel = nextValue
      ? isRent
        ? copy.payment.markRent
        : copy.payment.markDeposit
      : isRent
        ? copy.payment.unmarkRent
        : copy.payment.unmarkDeposit;
    const messageKey = `${isRent ? "rent" : "deposit"}${nextValue ? "Paid" : "Open"}`;

    setPaymentNote((isRent ? booking.rent_note : booking.deposit_note) || "");
    setConfirmation({
      kind: "payment",
      booking,
      field,
      title: confirmLabel,
      message: copy.confirmations[messageKey],
      confirmLabel,
      tone: "default",
    });
  };

  const downloadContractFile = async (booking, which) => {
    setBusyKey(`download:${which}:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(
        `/api/admin/bookings/${booking.id}/file?which=${which}`,
        { token }
      );
      openSignedUrl(data.signedUrl);
      setNotice({ type: "success", text: copy.downloadStarted });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const downloadPaymentProof = async (booking) => {
    setBusyKey(`download:proof:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(
        `/api/admin/bookings/${booking.id}/payment-proof`,
        { token }
      );
      openSignedUrl(data.signedUrl);
      setNotice({ type: "success", text: copy.downloadStarted });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const previewFile = async (booking, which) => {
    const requestId = `${booking.id}:${which}:${Date.now()}`;
    const isPaymentProof = which === "proof";
    const storagePath = isPaymentProof
      ? booking.rent_proof_path
      : which === "signed"
        ? booking.signed_contract_path
        : booking.final_contract_path;
    const title =
      which === "signed"
        ? copy.filePreview.signedTitle
        : which === "final"
          ? copy.filePreview.finalTitle
          : copy.filePreview.proofTitle;
    const endpoint = isPaymentProof
      ? `/api/admin/bookings/${booking.id}/payment-proof?preview=1`
      : `/api/admin/bookings/${booking.id}/file?which=${which}&preview=1`;

    setFilePreview({
      error: null,
      kind: isPaymentProof ? previewKind(storagePath) : "pdf",
      loading: true,
      requestId,
      title,
      url: null,
    });

    try {
      const data = await apiRequest(endpoint, { token });
      setFilePreview((current) =>
        current?.requestId === requestId
          ? { ...current, loading: false, url: data.signedUrl }
          : current
      );
    } catch (error) {
      if (handleApiError(error)) return;
      setFilePreview((current) =>
        current?.requestId === requestId
          ? {
              ...current,
              error: error.message || copy.filePreview.loadFailed,
              loading: false,
            }
          : current
      );
    }
  };

  const countersignBooking = async (booking, file) => {
    const body = new FormData();
    body.append("file", file);
    setBusyKey(`countersign:${booking.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(`/api/admin/bookings/${booking.id}/countersign`, {
        token,
        method: "POST",
        body,
      });
      setNotice({ type: "success", text: copy.countersignSaved });
      applyBookingResponse(data.booking);
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const requestCountersign = (booking, file) => {
    if (!booking.payment_method) {
      setNotice({ type: "error", text: copy.payment.methodRequired });
      return;
    }

    if (booking.payment_method === "online" && !booking.rent_proof_path) {
      setNotice({ type: "error", text: copy.payment.proofRequired });
      return;
    }

    if (!booking.rent_paid) {
      setNotice({ type: "error", text: copy.payment.rentRequired });
      return;
    }

    if (!file) {
      setNotice({ type: "error", text: copy.fileMissing });
      return;
    }

    if (!isPdfFile(file)) {
      setNotice({ type: "error", text: copy.fileType });
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setNotice({ type: "error", text: copy.fileSize });
      return;
    }

    setConfirmation({
      title: copy.actions.countersign,
      message: copy.confirmations.countersign,
      confirmLabel: copy.actions.countersign,
      tone: "default",
      onConfirm: () => countersignBooking(booking, file),
    });
  };

  const startEdit = (booking) => {
    setExpandedId(booking.id);
    setEditId(booking.id);
    setEditForm(makeEditForm(booking));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm(null);
  };

  const updateEditField = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editId || !editForm) return;

    setBusyKey(`edit:${editId}`);
    setNotice(null);

    try {
      const data = await apiRequest(`/api/admin/bookings/${editId}`, {
        token,
        method: "PATCH",
        body: normalizeEditPayload(editForm),
      });
      setNotice({ type: "success", text: copy.editSaved });
      applyBookingResponse(data.booking);
      setEditId(null);
      setEditForm(null);
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const submitBlockedDate = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!isFridayOrSaturday(blockForm.night)) {
      setNotice({
        type: "error",
        text: copy.needsFridaySaturday,
      });
      return;
    }

    setBusyKey("blocked:create");

    try {
      const data = await apiRequest("/api/admin/blocked", {
        token,
        method: "POST",
        body: blockForm,
      });
      setBlockedDates((current) =>
        [...current, data.blockedDate].sort((a, b) => a.night.localeCompare(b.night)),
      );
      setBlockForm(EMPTY_BLOCK_FORM);
      setNotice({ type: "success", text: copy.blockedSaved });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const removeBlockedDate = async (blockedDate) => {
    setBusyKey(`blocked:${blockedDate.id}`);
    setNotice(null);

    try {
      const data = await apiRequest(`/api/admin/blocked/${blockedDate.id}`, {
        token,
        method: "DELETE",
      });
      setBlockedDates((current) =>
        current.filter((item) => item.id !== data.blockedDate.id),
      );
      setNotice({ type: "success", text: copy.blockedRemoved });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const requestRemoveBlockedDate = (blockedDate) => {
    const label = formatNight(blockedDate.night, lang);
    setConfirmation({
      title: copy.actions.remove,
      message: copy.confirmations.unblock.replace("{date}", label),
      confirmLabel: copy.actions.remove,
      tone: "danger",
      onConfirm: () => removeBlockedDate(blockedDate),
    });
  };

  if (!token) {
    return (
      <>
        <Helmet>
          <title>{copy.pageTitle}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>

        <section className="editorial-section section-paper border-t-0 py-16 md:py-24">
          <div className="container-wide max-w-2xl select-text">
            <div className="flat-panel space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="eyebrow">{copy.admin}</p>
                  <h1 className="font-display text-4xl font-semibold md:text-5xl">
                    {copy.loginTitle}
                  </h1>
                  <p className="lead text-base">{copy.loginIntro}</p>
                </div>
                <LanguageSwitch copy={copy} lang={lang} setLang={setLang} />
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-ink">
                    {copy.password}
                  </span>
                  <input
                    className="form-input w-full px-4 py-3"
                    autoComplete="current-password"
                    autoFocus
                    disabled={loginStatus === "loading"}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    value={password}
                  />
                </label>

                <button
                  className="btn-primary w-full sm:w-auto"
                  disabled={loginStatus === "loading" || !password}
                  type="submit"
                >
                  {loginStatus === "loading" ? copy.checking : copy.login}
                </button>
              </form>

              <Notice notice={notice} />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <section className="editorial-section section-paper border-t-0 py-8 md:py-12">
        <div className="container-wide select-text space-y-8">
          <header className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">{copy.admin}</p>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">
                {copy.dashboardTitle}
              </h1>
              <p className="text-sm text-muted">
                {copy.sessionUntil.replace(
                  "{date}",
                  formatDateTime(session.expiresAt, lang, copy.notSet)
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitch copy={copy} lang={lang} setLang={setLang} />
              <button
                className={compactButtonClass("secondary")}
                disabled={loadStatus === "loading" || Boolean(busyKey)}
                onClick={() => refreshDashboard()}
                type="button"
              >
                {copy.refresh}
              </button>
              <button
                className={compactButtonClass("ghost")}
                onClick={logout}
                type="button"
              >
                {copy.logout}
              </button>
            </div>
          </header>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Statusfilter">
            {copy.filters.map((item) => (
              <button
                className={[
                  "min-h-11 border px-4 py-2 text-sm font-semibold transition-colors",
                  filter === item.value
                    ? "border-primary bg-primary text-surface"
                    : "border-line bg-surface text-ink hover:border-primary",
                ].join(" ")}
                key={item.value}
                onClick={() => setFilter(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <Notice notice={notice} />

          <BookingsTable
            bookings={bookings}
            busyKey={busyKey}
            copy={copy}
            editForm={editForm}
            editId={editId}
            expandedId={expandedId}
            failedApprovalEmailIds={failedApprovalEmailIds}
            lang={lang}
            loadStatus={loadStatus}
            onApprove={(booking) => requestBookingAction(booking, "approve")}
            onAssignTutor={requestTutorAssignment}
            onCancel={(booking) => requestBookingAction(booking, "cancel")}
            onCancelEdit={cancelEdit}
            onCountersign={requestCountersign}
            onDownloadFile={downloadContractFile}
            onDownloadPaymentProof={downloadPaymentProof}
            onEditFieldChange={updateEditField}
            onMarkPayment={requestPaymentChange}
            onPreviewFile={previewFile}
            onReject={(booking) => requestBookingAction(booking, "reject")}
            onRedo={(booking) => requestBookingAction(booking, "redo")}
            onResendApproval={resendApprovalEmail}
            onStartEdit={startEdit}
            onSubmitEdit={submitEdit}
            onToggleDetails={(booking) => {
              setEditId(null);
              setEditForm(null);
              setExpandedId((current) => (current === booking.id ? null : booking.id));
            }}
          />

          <BlockedDatesSection
            blockedDates={blockedDates}
            blockForm={blockForm}
            busyKey={busyKey}
            copy={copy}
            lang={lang}
            onBlockFormChange={(event) => {
              const { name, value } = event.target;
              setBlockForm((current) => ({ ...current, [name]: value }));
            }}
            onRemove={requestRemoveBlockedDate}
            onSubmit={submitBlockedDate}
          />
        </div>
      </section>
      <ConfirmModal
        busy={Boolean(busyKey)}
        confirmLabel={confirmation?.confirmLabel}
        message={confirmation?.message}
        onCancel={closeConfirmation}
        onConfirm={confirmAction}
        open={Boolean(confirmation)}
        title={confirmation?.title || ""}
        tone={confirmation?.tone}
      >
        {confirmation?.kind === "assignTutor" ? (
          <label className="mt-4 block space-y-2 text-ink">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              {copy.tutor.selectLabel}
            </span>
            <select
              className="form-input w-full px-3 py-2.5"
              onChange={(event) => setSelectedTutor(event.target.value)}
              value={selectedTutor}
            >
              {tutorNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {confirmation?.kind === "payment" ? (
          <label className="mt-4 block space-y-2 text-ink">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              {confirmation.field === "rent_paid"
                ? copy.payment.rentNoteLabel
                : copy.payment.depositNoteLabel}
            </span>
            <textarea
              className="form-textarea min-h-20 w-full px-3 py-2.5"
              onChange={(event) => setPaymentNote(event.target.value)}
              value={paymentNote}
            />
          </label>
        ) : null}
      </ConfirmModal>
      <FilePreviewModal
        error={filePreview?.error}
        kind={filePreview?.kind}
        labels={copy.filePreview}
        loading={Boolean(filePreview?.loading)}
        onClose={() => setFilePreview(null)}
        open={Boolean(filePreview)}
        title={filePreview?.title || ""}
        url={filePreview?.url}
      />
    </>
  );
}

function LanguageSwitch({ copy, lang, setLang }) {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{copy.language}</span>
      {["de", "en"].map((value) => (
        <button
          className={[
            "min-h-11 border px-3 py-2 text-xs font-semibold transition-colors",
            lang === value
              ? "border-primary bg-primary text-surface"
              : "border-line bg-surface text-muted hover:border-primary hover:text-primary",
          ].join(" ")}
          key={value}
          onClick={() => setLang(value)}
          type="button"
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Notice({ notice }) {
  if (!notice) return null;

  const isError = notice.type === "error";

  return (
    <div
      className={[
        "border px-4 py-3 text-sm font-semibold",
        isError
          ? "border-danger bg-brick-tint text-danger"
          : "border-success bg-surface text-success",
      ].join(" ")}
      role={isError ? "alert" : "status"}
    >
      {notice.text}
    </div>
  );
}

function BookingsTable({
  bookings,
  busyKey,
  copy,
  editForm,
  editId,
  expandedId,
  failedApprovalEmailIds,
  lang,
  loadStatus,
  onApprove,
  onAssignTutor,
  onCancel,
  onCancelEdit,
  onCountersign,
  onDownloadFile,
  onDownloadPaymentProof,
  onEditFieldChange,
  onMarkPayment,
  onPreviewFile,
  onReject,
  onRedo,
  onResendApproval,
  onStartEdit,
  onSubmitEdit,
  onToggleDetails,
}) {
  if (loadStatus === "loading") {
    return (
      <div className="flat-panel">
        <p className="font-semibold">{copy.loadingBookings}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flat-panel">
        <p className="font-semibold">{copy.noBookings}</p>
      </div>
    );
  }

  return (
    <div className="flat-panel overflow-hidden p-0">
      <div className="hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="w-[24%] border-b border-line px-4 py-3 font-semibold">
                {copy.table.date}
              </th>
              <th className="w-[18%] border-b border-line px-4 py-3 font-semibold">
                {copy.table.name}
              </th>
              <th className="w-[16%] border-b border-line px-4 py-3 font-semibold">
                {copy.table.rate}
              </th>
              <th className="w-[14%] border-b border-line px-4 py-3 font-semibold">
                {copy.table.status}
              </th>
              <th className="w-[16%] border-b border-line px-4 py-3 font-semibold">
                {copy.table.payment}
              </th>
              <th className="w-[12%] border-b border-line px-4 py-3 font-semibold">
                {copy.table.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <Fragment key={booking.id}>
                <tr className="border-b border-line align-top">
                  <td className={`border-l-4 px-4 py-4 ${statusAccentClass(booking)}`}>
                    <div className="font-semibold text-ink">
                      {formatNight(booking.night, lang)}
                    </div>
                    {booking.confirm_deadline ? (
                      <div className="mt-1 text-xs text-muted">
                        {copy.table.deadline}:{" "}
                        {formatDateTime(booking.confirm_deadline, lang, copy.notSet)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold">{booking.requester_name}</div>
                    <div className="mt-1 text-xs text-muted">
                      {copy.table.guests}:{" "}
                      {booking.guest_count ?? copy.table.openGuests}
                    </div>
                    {booking.assigned_tutor ? (
                      <AssignedTutorLabel booking={booking} copy={copy} />
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div>{copy.residencies[booking.residency] || booking.residency}</div>
                    <div className="mt-1 font-semibold">
                      {formatMoney(booking.price, lang)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={[
                        "inline-flex border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em]",
                        statusClass(booking),
                      ].join(" ")}
                    >
                      {statusText(booking, copy)}
                    </span>
                    {failedApprovalEmailIds.has(booking.id) ? (
                      <ApprovalEmailWarning copy={copy} />
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <PaymentSummary booking={booking} copy={copy} />
                  </td>
                  <td className="px-4 py-4">
                    <BookingActions
                      booking={booking}
                      busyKey={busyKey}
                      copy={copy}
                      isExpanded={expandedId === booking.id}
                      onApprove={onApprove}
                      onAssignTutor={onAssignTutor}
                      onReject={onReject}
                      onResendApproval={onResendApproval}
                      onToggleDetails={onToggleDetails}
                    />
                  </td>
                </tr>
                {expandedId === booking.id ? (
                  <tr className="border-b border-line bg-paper/70">
                    <td className="px-4 py-5" colSpan={6}>
                      <ExpandedBookingContent
                        booking={booking}
                        busyKey={busyKey}
                        copy={copy}
                        editForm={editForm}
                        editId={editId}
                        lang={lang}
                      onCancel={onCancel}
                      onCancelEdit={onCancelEdit}
                      onCountersign={onCountersign}
                      onDownloadFile={onDownloadFile}
                      onDownloadPaymentProof={onDownloadPaymentProof}
                      onEditFieldChange={onEditFieldChange}
                      onMarkPayment={onMarkPayment}
                      onPreviewFile={onPreviewFile}
                      onRedo={onRedo}
                      onStartEdit={onStartEdit}
                      onSubmitEdit={onSubmitEdit}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-px bg-line lg:hidden">
        {bookings.map((booking) => (
          <article
            className={`border-l-4 bg-surface p-4 sm:p-5 ${statusAccentClass(booking)}`}
            key={booking.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="font-semibold leading-snug text-ink">
                  {formatNight(booking.night, lang)}
                </div>
                <div className="break-words text-sm font-semibold">
                  {booking.requester_name}
                </div>
                {booking.assigned_tutor ? (
                  <AssignedTutorLabel booking={booking} copy={copy} />
                ) : null}
                {booking.confirm_deadline ? (
                  <div className="text-xs text-muted">
                    {copy.table.deadline}:{" "}
                    {formatDateTime(booking.confirm_deadline, lang, copy.notSet)}
                  </div>
                ) : null}
              </div>

              <span
                className={[
                  "inline-flex w-fit border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em]",
                  statusClass(booking),
                ].join(" ")}
              >
                {statusText(booking, copy)}
              </span>
            </div>

            {failedApprovalEmailIds.has(booking.id) ? (
              <ApprovalEmailWarning copy={copy} />
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  {copy.table.rate}
                </div>
                <div className="mt-1 text-sm">
                  {copy.residencies[booking.residency] || booking.residency}
                </div>
                <div className="font-semibold">{formatMoney(booking.price, lang)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  {copy.table.payment}
                </div>
                <div className="mt-1 text-sm">
                  <PaymentSummary booking={booking} copy={copy} />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <BookingActions
                booking={booking}
                busyKey={busyKey}
                copy={copy}
                isExpanded={expandedId === booking.id}
                onApprove={onApprove}
                onAssignTutor={onAssignTutor}
                onReject={onReject}
                onResendApproval={onResendApproval}
                onToggleDetails={onToggleDetails}
              />
            </div>

            {expandedId === booking.id ? (
              <div className="mt-5 border-t border-line pt-5">
                <ExpandedBookingContent
                  booking={booking}
                  busyKey={busyKey}
                  copy={copy}
                  editForm={editForm}
                  editId={editId}
                  lang={lang}
                  onCancel={onCancel}
                  onCancelEdit={onCancelEdit}
                  onCountersign={onCountersign}
                  onDownloadFile={onDownloadFile}
                  onDownloadPaymentProof={onDownloadPaymentProof}
                  onEditFieldChange={onEditFieldChange}
                  onMarkPayment={onMarkPayment}
                  onPreviewFile={onPreviewFile}
                  onRedo={onRedo}
                  onStartEdit={onStartEdit}
                  onSubmitEdit={onSubmitEdit}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function ExpandedBookingContent({
  booking,
  busyKey,
  copy,
  editForm,
  editId,
  lang,
  onCancel,
  onCancelEdit,
  onCountersign,
  onDownloadFile,
  onDownloadPaymentProof,
  onEditFieldChange,
  onMarkPayment,
  onPreviewFile,
  onRedo,
  onStartEdit,
  onSubmitEdit,
}) {
  if (editId === booking.id && editForm) {
    return (
      <EditBookingForm
        busyKey={busyKey}
        copy={copy}
        form={editForm}
        onCancel={onCancelEdit}
        onChange={onEditFieldChange}
        onSubmit={onSubmitEdit}
      />
    );
  }

  return (
    <BookingDetails
      booking={booking}
      busyKey={busyKey}
      copy={copy}
      lang={lang}
      onCancel={onCancel}
      onCountersign={onCountersign}
      onDownloadFile={onDownloadFile}
      onDownloadPaymentProof={onDownloadPaymentProof}
      onMarkPayment={onMarkPayment}
      onPreviewFile={onPreviewFile}
      onRedo={onRedo}
      onStartEdit={onStartEdit}
    />
  );
}

function PaymentSummary({ booking, copy }) {
  return (
    <div className="space-y-1">
      <div className="font-semibold text-ink">
        {copy.payment.method}: {paymentMethodText(booking, copy)}
      </div>
      <PaymentFlag copy={copy} paid={booking.rent_paid} label={copy.payment.rent} />
      <PaymentFlag
        copy={copy}
        paid={booking.deposit_paid}
        label={copy.payment.deposit}
      />
      <div
        className={
          booking.payment_method === "online" && booking.rent_proof_path
            ? "font-semibold text-success"
            : "text-muted"
        }
      >
        {paymentProofText(booking, copy)}
      </div>
    </div>
  );
}

function PaymentFlag({ copy, label, paid }) {
  return (
    <div className={paid ? "font-semibold text-success" : "text-muted"}>
      {label}: {paid ? copy.payment.paid : copy.payment.open}
    </div>
  );
}

function BookingActions({
  booking,
  busyKey,
  copy,
  isExpanded,
  onApprove,
  onAssignTutor,
  onReject,
  onResendApproval,
  onToggleDetails,
}) {
  const busy = Boolean(busyKey);

  return (
    <div className="flex flex-wrap gap-2">
      {booking.status === "pending" ? (
        <>
          <button
            className={compactButtonClass("primary")}
            disabled={busy}
            onClick={() => onApprove(booking)}
            type="button"
          >
            {copy.actions.approve}
          </button>
          <button
            className={compactButtonClass("danger")}
            disabled={busy}
            onClick={() => onReject(booking)}
            type="button"
          >
            {copy.actions.reject}
          </button>
        </>
      ) : null}

      {booking.status === "approved" ? (
        <button
          className={compactButtonClass("secondary")}
          disabled={busy}
          onClick={() => onResendApproval(booking)}
          type="button"
        >
          {copy.approvalEmail.resend}
        </button>
      ) : null}

      <button
        className={compactButtonClass("secondary")}
        disabled={busy}
        onClick={() => onAssignTutor(booking)}
        type="button"
      >
        {copy.tutor.assignAction}
      </button>

      <button
        className={compactButtonClass("ghost")}
        disabled={busy}
        onClick={() => onToggleDetails(booking)}
        type="button"
      >
        {isExpanded ? copy.actions.close : copy.actions.details}
      </button>
    </div>
  );
}

function AssignedTutorLabel({ booking, copy }) {
  return (
    <div className="mt-2 border-l-2 border-primary pl-2 text-xs font-semibold text-primary-dark">
      {copy.tutor.assigned.replace("{name}", booking.assigned_tutor)}
    </div>
  );
}

function ApprovalEmailWarning({ copy }) {
  return (
    <div
      className="mt-2 border border-danger bg-brick-tint px-2.5 py-2 text-xs font-semibold text-danger"
      role="alert"
    >
      {copy.approvalEmail.approvedButFailed}
    </div>
  );
}

function BookingDetails({
  booking,
  busyKey,
  copy,
  lang,
  onCancel,
  onCountersign,
  onDownloadFile,
  onDownloadPaymentProof,
  onMarkPayment,
  onPreviewFile,
  onRedo,
  onStartEdit,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailCard title={copy.details.groups.contact}>
          <DetailBlock
            label={copy.table.contact}
            value={`${booking.email}\n${booking.phone || copy.table.noPhone}`}
          />
          <DetailBlock label={copy.details.address} value={booking.address} />
          <DetailBlock
            label={copy.table.guests}
            value={booking.guest_count ?? copy.table.openGuests}
          />
          <DetailBlock
            label={copy.details.additionalInfo}
            value={booking.additional_info || copy.details.notProvided}
          />
          <DetailBlock
            label={copy.tutor.detailLabel}
            value={booking.assigned_tutor || copy.notSet}
          />
          <DetailBlock
            label={copy.details.language}
            value={booking.lang === "en" ? "EN" : "DE"}
          />
        </DetailCard>

        <DetailCard title={copy.details.groups.timeline}>
          <DetailBlock
            label={copy.table.created}
            value={formatDateTime(booking.created_at, lang, copy.notSet)}
          />
          <DetailBlock
            label={copy.details.reviewed}
            value={formatDateTime(booking.reviewed_at, lang, copy.notSet)}
          />
          <DetailBlock
            label={copy.details.rentPaidAt}
            value={formatDateTime(booking.rent_paid_at, lang, copy.notSet)}
          />
          <DetailBlock
            label={copy.details.depositPaidAt}
            value={formatDateTime(booking.deposit_paid_at, lang, copy.notSet)}
          />
          <DetailBlock
            label={copy.details.signedAt}
            value={formatDateTime(booking.countersigned_at, lang, copy.notSet)}
          />
        </DetailCard>

        <SystemNotesCard booking={booking} copy={copy} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PaymentActions
          booking={booking}
          busyKey={busyKey}
          copy={copy}
          onDownloadPaymentProof={onDownloadPaymentProof}
          onMarkPayment={onMarkPayment}
          onPreviewFile={onPreviewFile}
        />
        <SecondaryBookingActions
          booking={booking}
          busyKey={busyKey}
          copy={copy}
          onCancel={onCancel}
          onRedo={onRedo}
          onStartEdit={onStartEdit}
        />
      </div>

      <ContractPanel
        booking={booking}
        busyKey={busyKey}
        copy={copy}
        onCountersign={onCountersign}
        onDownloadFile={onDownloadFile}
        onPreviewFile={onPreviewFile}
      />
    </div>
  );
}

function SystemNotesCard({ booking, copy }) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <DetailCard title={copy.details.groups.system}>
      <DetailBlock
        label={copy.details.internalNotes}
        value={booking.internal_notes || copy.details.noInternalNotes}
      />
      <button
        type="button"
        className="text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:text-primary-dark"
        onClick={() => setShowTechnical((current) => !current)}
      >
        {showTechnical ? copy.details.hideTechnical : copy.details.showTechnical}
      </button>
      {showTechnical ? (
        <div className="space-y-3 border-t border-line pt-3">
          <DetailBlock label={copy.details.bookingId} value={booking.id} mono />
          <DetailBlock
            label={copy.details.accessToken}
            value={booking.access_token || copy.notSet}
            mono
          />
          <DetailBlock
            label={copy.details.signedPath}
            value={booking.signed_contract_path ? copy.details.yes : copy.details.no}
          />
          <DetailBlock
            label={copy.details.finalPath}
            value={booking.final_contract_path ? copy.details.yes : copy.details.no}
          />
        </div>
      ) : null}
    </DetailCard>
  );
}

function DetailCard({ children, title }) {
  return (
    <div className="border border-line bg-surface p-4">
      <h4 className="mb-3 border-b border-line pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PaymentNote({ label, value }) {
  return (
    <div className="border-l-2 border-primary pl-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-ink">
        {value}
      </p>
    </div>
  );
}

function PaymentActions({
  booking,
  busyKey,
  copy,
  onDownloadPaymentProof,
  onMarkPayment,
  onPreviewFile,
}) {
  const busy = Boolean(busyKey);
  const canManagePayment =
    (booking.status === "signed" || booking.status === "confirmed") && !booking.isExpired;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {copy.table.payment}
      </div>
      <div className="space-y-1 text-sm">
        <div>
          {copy.payment.method}:{" "}
          <span className="font-semibold">
            {paymentMethodText(booking, copy)}
          </span>
        </div>
        <div
          className={
            booking.payment_method === "online" && booking.rent_proof_path
              ? "font-semibold text-success"
              : "text-muted"
          }
        >
          {paymentProofText(booking, copy)}
        </div>
      </div>
      {booking.rent_note ? (
        <PaymentNote label={copy.payment.rentNoteLabel} value={booking.rent_note} />
      ) : null}
      {booking.deposit_note ? (
        <PaymentNote label={copy.payment.depositNoteLabel} value={booking.deposit_note} />
      ) : null}
      <div className="flex flex-wrap gap-2">
        {booking.rent_proof_path ? (
          <>
            <button
              className={compactButtonClass("secondary")}
              disabled={busy}
              onClick={() => onDownloadPaymentProof(booking)}
              type="button"
            >
              {copy.actions.downloadProof}
            </button>
            <button
              className={compactButtonClass("sky")}
              disabled={busy}
              onClick={() => onPreviewFile(booking, "proof")}
              type="button"
            >
              {copy.filePreview.action}
            </button>
          </>
        ) : null}
        {canManagePayment ? (
          <button
            className={compactButtonClass("secondary")}
            disabled={busy}
            onClick={() => onMarkPayment(booking, "rent_paid")}
            type="button"
          >
            {booking.rent_paid ? copy.payment.unmarkRent : copy.payment.markRent}
          </button>
        ) : null}
        {canManagePayment ? (
          <button
            className={compactButtonClass("secondary")}
            disabled={busy}
            onClick={() => onMarkPayment(booking, "deposit_paid")}
            type="button"
          >
            {booking.deposit_paid
              ? copy.payment.unmarkDeposit
              : copy.payment.markDeposit}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SecondaryBookingActions({
  booking,
  busyKey,
  copy,
  onCancel,
  onRedo,
  onStartEdit,
}) {
  const busy = Boolean(busyKey);
  // Cancel stays available for confirmed bookings so a tutor can release the
  // night if a confirmed event falls through; only closed bookings hide it.
  const canCancel =
    booking.status !== "rejected" && booking.status !== "cancelled";
  const canRequestRedo =
    booking.status === "approved" || booking.status === "signed" || booking.isExpired;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {copy.table.actions}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={compactButtonClass("secondary")}
          disabled={busy}
          onClick={() => onStartEdit(booking)}
          type="button"
        >
          {copy.actions.edit}
        </button>
        {canRequestRedo ? (
          <button
            className={compactButtonClass("secondary")}
            disabled={busy}
            onClick={() => onRedo(booking)}
            type="button"
          >
            {copy.actions.requestRedo}
          </button>
        ) : null}
        {canCancel ? (
          <button
            className={compactButtonClass("danger")}
            disabled={busy}
            onClick={() => onCancel(booking)}
            type="button"
          >
            {copy.actions.cancel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ChecklistItem({ label, ok }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center text-[0.6rem] font-bold leading-none",
          ok ? "bg-success text-surface" : "border border-danger text-danger",
        ].join(" ")}
        aria-hidden="true"
      >
        {ok ? "✓" : "!"}
      </span>
      <span className={ok ? "text-ink" : "font-semibold text-danger"}>{label}</span>
    </li>
  );
}

function ContractPanel({
  booking,
  busyKey,
  copy,
  onCountersign,
  onDownloadFile,
  onPreviewFile,
}) {
  const [file, setFile] = useState(null);
  const busy = Boolean(busyKey);
  const hasRequiredPayment =
    booking.payment_method === "cash" ||
    (booking.payment_method === "online" && Boolean(booking.rent_proof_path));
  const canCountersign =
    booking.status === "signed" &&
    Boolean(booking.signed_contract_path) &&
    booking.rent_paid &&
    hasRequiredPayment;
  const showChecklist =
    booking.status === "signed" && Boolean(booking.signed_contract_path);

  const submit = (event) => {
    event.preventDefault();
    onCountersign(booking, file);
  };

  return (
    <div className="border-t border-line pt-5 lg:col-span-3">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {copy.details.contractWork}
            </div>
            <div className="mt-1 text-sm text-muted">{copy.details.uploadHint}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {booking.signed_contract_path ? (
              <>
                <button
                  className={compactButtonClass("secondary")}
                  disabled={busy}
                  onClick={() => onDownloadFile(booking, "signed")}
                  type="button"
                >
                  {copy.actions.downloadSigned}
                </button>
                <button
                  className={compactButtonClass("sky")}
                  disabled={busy}
                  onClick={() => onPreviewFile(booking, "signed")}
                  type="button"
                >
                  {copy.filePreview.action}
                </button>
              </>
            ) : null}
            {booking.final_contract_path ? (
              <>
                <button
                  className={compactButtonClass("secondary")}
                  disabled={busy}
                  onClick={() => onDownloadFile(booking, "final")}
                  type="button"
                >
                  {copy.actions.downloadFinal}
                </button>
                <button
                  className={compactButtonClass("sky")}
                  disabled={busy}
                  onClick={() => onPreviewFile(booking, "final")}
                  type="button"
                >
                  {copy.filePreview.action}
                </button>
              </>
            ) : null}
          </div>
          {showChecklist ? (
            <div className="space-y-2 border border-line bg-paper p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {copy.payment.beforeCountersign}
              </div>
              <ul className="space-y-1.5">
                <ChecklistItem
                  ok={Boolean(booking.payment_method)}
                  label={copy.payment.checkMethod}
                />
                {booking.payment_method === "online" ? (
                  <ChecklistItem
                    ok={Boolean(booking.rent_proof_path)}
                    label={copy.payment.checkProof}
                  />
                ) : null}
                <ChecklistItem
                  ok={Boolean(booking.rent_paid)}
                  label={copy.payment.checkRent}
                />
              </ul>
            </div>
          ) : null}
        </div>

        {canCountersign ? (
          <form className="space-y-3" onSubmit={submit}>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                {copy.actions.chooseFinal}
              </span>
              <input
                accept="application/pdf,.pdf"
                className="form-input w-full px-3 py-2"
                disabled={busy}
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                type="file"
              />
            </label>
            <button
              className={compactButtonClass("primary")}
              disabled={busy}
              type="submit"
            >
              {busyKey === `countersign:${booking.id}`
                ? copy.actions.countersigning
                : copy.actions.countersign}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function DetailBlock({ label, mono = false, value }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div
        className={[
          "whitespace-pre-wrap break-words text-ink",
          mono
            ? "font-mono text-xs"
            : "text-[0.95rem] font-semibold sm:text-base",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function EditBookingForm({ busyKey, copy, form, onCancel, onChange, onSubmit }) {
  const busy = Boolean(busyKey);

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <AdminField label={copy.edit.name}>
        <input
          className="form-input w-full px-3 py-2"
          disabled={busy}
          name="requester_name"
          onChange={onChange}
          required
          value={form.requester_name}
        />
      </AdminField>

      <AdminField label={copy.edit.email}>
        <input
          className="form-input w-full px-3 py-2"
          disabled={busy}
          name="email"
          onChange={onChange}
          required
          type="email"
          value={form.email}
        />
      </AdminField>

      <AdminField label={copy.edit.phone}>
        <input
          className="form-input w-full px-3 py-2"
          disabled={busy}
          name="phone"
          onChange={onChange}
          value={form.phone}
        />
      </AdminField>

      <AdminField label={copy.edit.rate}>
        <select
          className="form-select w-full px-3 py-2"
          disabled={busy}
          name="residency"
          onChange={onChange}
          value={form.residency}
        >
          <option value="roko">{copy.residencies.roko}</option>
          <option value="christophorusweg">{copy.residencies.christophorusweg}</option>
          <option value="rosenbachweg">{copy.residencies.rosenbachweg}</option>
          <option value="external">{copy.residencies.external}</option>
        </select>
      </AdminField>

      <AdminField label={copy.edit.guests}>
        <input
          className="form-input w-full px-3 py-2"
          disabled={busy}
          min="1"
          name="guest_count"
          onChange={onChange}
          type="number"
          value={form.guest_count}
        />
      </AdminField>

      <AdminField className="md:col-span-2" label={copy.edit.address}>
        <textarea
          className="form-textarea min-h-24 w-full px-3 py-2"
          disabled={busy}
          name="address"
          onChange={onChange}
          required
          value={form.address}
        />
      </AdminField>

      <AdminField label={copy.edit.additionalInfo}>
        <textarea
          className="form-textarea min-h-28 w-full px-3 py-2"
          disabled={busy}
          name="additional_info"
          onChange={onChange}
          value={form.additional_info}
        />
      </AdminField>

      <AdminField label={copy.edit.internalNotes}>
        <textarea
          className="form-textarea min-h-28 w-full px-3 py-2"
          disabled={busy}
          name="internal_notes"
          onChange={onChange}
          value={form.internal_notes}
        />
      </AdminField>

      <div className="flex flex-wrap gap-2 md:col-span-2">
        <button className={compactButtonClass("primary")} disabled={busy} type="submit">
          {copy.actions.save}
        </button>
        <button
          className={compactButtonClass("ghost")}
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          {copy.actions.abort}
        </button>
      </div>
    </form>
  );
}

function AdminField({ children, className = "", label }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function BlockedDatesSection({
  blockedDates,
  blockForm,
  busyKey,
  copy,
  lang,
  onBlockFormChange,
  onRemove,
  onSubmit,
}) {
  const busy = Boolean(busyKey);

  return (
    <section className="flat-panel space-y-6" aria-labelledby="admin-blocked-dates">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{copy.blocked.eyebrow}</p>
          <h2 id="admin-blocked-dates" className="font-display text-3xl font-semibold">
            {copy.blocked.title}
          </h2>
        </div>
      </div>

      <form className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]" onSubmit={onSubmit}>
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            {copy.blocked.date}
          </span>
          <input
            className="form-input w-full px-3 py-2"
            disabled={busy}
            min={tomorrowIso()}
            name="night"
            onChange={onBlockFormChange}
            required
            type="date"
            value={blockForm.night}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            {copy.blocked.reason}
          </span>
          <input
            className="form-input w-full px-3 py-2"
            disabled={busy}
            name="reason"
            onChange={onBlockFormChange}
            placeholder={copy.blocked.reasonPlaceholder}
            value={blockForm.reason}
          />
        </label>

        <div className="flex items-end">
          <button className={compactButtonClass("primary")} disabled={busy} type="submit">
            {copy.actions.block}
          </button>
        </div>
      </form>

      {blockedDates.length === 0 ? (
        <p className="border-t border-line pt-4 text-sm text-muted">
          {copy.blocked.empty}
        </p>
      ) : (
        <div className="border-t border-line pt-4">
          <div className="grid gap-px bg-line md:hidden">
            {blockedDates.map((blockedDate) => (
              <article className="bg-surface p-4" key={blockedDate.id}>
                <div className="font-semibold">
                  {formatNight(blockedDate.night, lang)}
                </div>
                <div className="mt-2 text-sm text-muted">
                  {blockedDate.reason || copy.blocked.noReason}
                </div>
                <div className="mt-2 text-xs text-muted">
                  {copy.blocked.created}:{" "}
                  {formatDateTime(blockedDate.created_at, lang, copy.notSet)}
                </div>
                <button
                  className={`${compactButtonClass("danger")} mt-4`}
                  disabled={busy}
                  onClick={() => onRemove(blockedDate)}
                  type="button"
                >
                  {copy.actions.remove}
                </button>
              </article>
            ))}
          </div>

          <table className="hidden w-full border-collapse text-left text-sm md:table">
            <thead className="text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="border-b border-line px-3 py-2 font-semibold">
                  {copy.blocked.date}
                </th>
                <th className="border-b border-line px-3 py-2 font-semibold">
                  {copy.blocked.reason}
                </th>
                <th className="border-b border-line px-3 py-2 font-semibold">
                  {copy.blocked.created}
                </th>
                <th className="border-b border-line px-3 py-2 font-semibold">
                  {copy.blocked.action}
                </th>
              </tr>
            </thead>
            <tbody>
              {blockedDates.map((blockedDate) => (
                <tr className="border-b border-line" key={blockedDate.id}>
                  <td className="px-3 py-3 font-semibold">
                    {formatNight(blockedDate.night, lang)}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {blockedDate.reason || copy.blocked.noReason}
                  </td>
                  <td className="px-3 py-3">
                    {formatDateTime(blockedDate.created_at, lang, copy.notSet)}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className={compactButtonClass("danger")}
                      disabled={busy}
                      onClick={() => onRemove(blockedDate)}
                      type="button"
                    >
                      {copy.actions.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
