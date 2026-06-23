import { Fragment, useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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
    loginIntro: "Anmeldung fuer Tutorinnen und Tutoren.",
    password: "Passwort",
    checking: "Pruefe...",
    login: "Anmelden",
    dashboardTitle: "Buchungsverwaltung",
    sessionUntil: "Sitzung gueltig bis {date}",
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
    needsFridaySaturday: "Bitte einen Freitag oder Samstag auswaehlen.",
    fileMissing: "Bitte eine PDF-Datei auswaehlen.",
    fileType: "Bitte eine PDF-Datei hochladen.",
    fileSize: "Die PDF-Datei darf maximal 4 MB gross sein.",
    countersignSaved: "Gegengezeichneter Vertrag gespeichert.",
    downloadStarted: "Download vorbereitet.",
    confirms: {
      reject: "Diese Anfrage ablehnen?",
      cancel: "Diese Buchung stornieren?",
      unblock: "{date} freigeben?",
    },
    actionSaved: {
      approve: "Freigabe gespeichert.",
      reject: "Ablehnung gespeichert.",
      cancel: "Storno gespeichert.",
    },
    filters: [
      { value: "pending", label: "Ausstehend" },
      { value: "approved", label: "Freigegeben" },
      { value: "signed", label: "Signiert" },
      { value: "confirmed", label: "Bestaetigt" },
      { value: "all", label: "Alle" },
    ],
    statuses: {
      pending: "Ausstehend",
      approved: "Freigegeben",
      signed: "Signiert",
      confirmed: "Bestaetigt",
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
      guests: "Gaeste",
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
      methodMissing: "Nicht gewaehlt",
      paid: "bezahlt",
      open: "offen",
      proofUploaded: "Nachweis hochgeladen",
      proofAwaiting: "Nachweis fehlt",
      proofNotNeeded: "Kein Nachweis noetig",
      proofRequired:
        "Online-Zahlungsnachweis muss hochgeladen sein, bevor gegengezeichnet werden kann.",
      methodRequired:
        "Zahlungsart fuer die Miete muss gewaehlt sein, bevor gegengezeichnet werden kann.",
      markRent: "Miete bezahlt",
      markDeposit: "Kaution bezahlt",
      prompt: "Optionale Zahlungsnotiz fuer {label}",
      saved: "{label} als bezahlt markiert.",
    },
    contractStates: {
      none: "Noch kein Vertrag",
      waiting: "Wartet auf Upload",
      signed: "Signiert hochgeladen",
      final: "Gegengezeichnet",
      closed: "Geschlossen",
    },
    actions: {
      approve: "Freigeben",
      reject: "Ablehnen",
      cancel: "Stornieren",
      edit: "Bearbeiten",
      details: "Details",
      close: "Schliessen",
      save: "Speichern",
      abort: "Abbrechen",
      downloadSigned: "Signierte PDF",
      downloadFinal: "Finale PDF",
      downloadProof: "Zahlungsnachweis",
      countersign: "Gegenzeichnen",
      countersigning: "Laedt hoch...",
      chooseFinal: "Finale PDF auswaehlen",
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
      reviewed: "Geprueft",
      rentPaidAt: "Miete bezahlt am",
      depositPaidAt: "Kaution bezahlt am",
      signedAt: "Gegengezeichnet am",
      notProvided: "Nicht angegeben",
      noInternalNotes: "Keine internen Notizen",
      noPaymentNote: "Keine Notiz",
      signedPath: "Signierte PDF gespeichert",
      finalPath: "Finale PDF gespeichert",
      yes: "Ja",
      no: "Nein",
      contractWork: "Vertragsablauf",
      uploadHint: "Nur PDF, maximal 4 MB. Beim Hochladen wird die Buchung bestaetigt.",
    },
    edit: {
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      rate: "Tarif",
      guests: "Gaestezahl",
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
      unblock: "Release {date}?",
    },
    actionSaved: {
      approve: "Approval saved.",
      reject: "Rejection saved.",
      cancel: "Cancellation saved.",
    },
    filters: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "signed", label: "Signed" },
      { value: "confirmed", label: "Confirmed" },
      { value: "all", label: "All" },
    ],
    statuses: {
      pending: "Pending",
      approved: "Approved",
      signed: "Signed",
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
      markRent: "Rent paid",
      markDeposit: "Deposit paid",
      prompt: "Optional payment note for {label}",
      saved: "{label} marked as paid.",
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

async function apiRequest(path, { token, method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(path, {
    method,
    headers,
    body:
      body === undefined || isFormData
        ? body
        : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || "Request failed.", response.status);
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

export default function Admin() {
  const { lang, setLang } = useLanguage();
  const copy = COPY[lang] || COPY.de;
  const [storedSession] = useState(() => readStoredSession());
  const [session, setSession] = useState(storedSession.session);
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("idle");
  const [filter, setFilter] = useState("pending");
  const [bookings, setBookings] = useState([]);
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
  const token = session?.token;

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setPassword("");
    setBookings([]);
    setBlockedDates([]);
    setExpandedId(null);
    setEditId(null);
    setEditForm(null);
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
    if (action === "reject" && !window.confirm(copy.confirms.reject)) return;
    if (action === "cancel" && !window.confirm(copy.confirms.cancel)) return;

    setBusyKey(`${action}:${booking.id}`);
    setNotice(null);

    try {
      await apiRequest(`/api/admin/bookings/${booking.id}/${action}`, {
        token,
        method: "POST",
      });
      setNotice({ type: "success", text: copy.actionSaved[action] });
      await refreshDashboard({ silent: true });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const markPayment = async (booking, field) => {
    const label = field === "rent_paid" ? copy.payment.rent : copy.payment.deposit;
    const note = window.prompt(
      copy.payment.prompt.replace("{label}", label),
      booking.payment_note || ""
    );

    if (note === null) return;

    setBusyKey(`${field}:${booking.id}`);
    setNotice(null);

    try {
      await apiRequest(`/api/admin/bookings/${booking.id}/payment`, {
        token,
        method: "POST",
        body: {
          [field]: true,
          payment_note: note,
        },
      });
      setNotice({
        type: "success",
        text: copy.payment.saved.replace("{label}", label),
      });
      await refreshDashboard({ silent: true });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
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

  const countersignBooking = async (booking, file) => {
    if (!booking.payment_method) {
      setNotice({ type: "error", text: copy.payment.methodRequired });
      return;
    }

    if (booking.payment_method === "online" && !booking.rent_proof_path) {
      setNotice({ type: "error", text: copy.payment.proofRequired });
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

    const body = new FormData();
    body.append("file", file);
    setBusyKey(`countersign:${booking.id}`);
    setNotice(null);

    try {
      await apiRequest(`/api/admin/bookings/${booking.id}/countersign`, {
        token,
        method: "POST",
        body,
      });
      setNotice({ type: "success", text: copy.countersignSaved });
      await refreshDashboard({ silent: true });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
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
      await apiRequest(`/api/admin/bookings/${editId}`, {
        token,
        method: "PATCH",
        body: normalizeEditPayload(editForm),
      });
      setNotice({ type: "success", text: copy.editSaved });
      setEditId(null);
      setEditForm(null);
      await refreshDashboard({ silent: true });
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
      await apiRequest("/api/admin/blocked", {
        token,
        method: "POST",
        body: blockForm,
      });
      setBlockForm(EMPTY_BLOCK_FORM);
      setNotice({ type: "success", text: copy.blockedSaved });
      await refreshDashboard({ silent: true });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
  };

  const removeBlockedDate = async (blockedDate) => {
    const label = formatNight(blockedDate.night, lang);
    if (!window.confirm(copy.confirms.unblock.replace("{date}", label))) return;

    setBusyKey(`blocked:${blockedDate.id}`);
    setNotice(null);

    try {
      await apiRequest(`/api/admin/blocked/${blockedDate.id}`, {
        token,
        method: "DELETE",
      });
      setNotice({ type: "success", text: copy.blockedRemoved });
      await refreshDashboard({ silent: true });
    } catch (error) {
      if (!handleApiError(error)) {
        setNotice({ type: "error", text: error.message });
      }
    } finally {
      setBusyKey(null);
    }
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
            lang={lang}
            loadStatus={loadStatus}
            onApprove={(booking) => runBookingAction(booking, "approve")}
            onCancel={(booking) => runBookingAction(booking, "cancel")}
            onCancelEdit={cancelEdit}
            onCountersign={countersignBooking}
            onDownloadFile={downloadContractFile}
            onDownloadPaymentProof={downloadPaymentProof}
            onEditFieldChange={updateEditField}
            onMarkPayment={markPayment}
            onReject={(booking) => runBookingAction(booking, "reject")}
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
            onRemove={removeBlockedDate}
            onSubmit={submitBlockedDate}
          />
        </div>
      </section>
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
  lang,
  loadStatus,
  onApprove,
  onCancel,
  onCancelEdit,
  onCountersign,
  onDownloadFile,
  onDownloadPaymentProof,
  onEditFieldChange,
  onMarkPayment,
  onReject,
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
                  <td className="px-4 py-4">
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
                      onReject={onReject}
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
          <article className="bg-surface p-4 sm:p-5" key={booking.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="font-semibold leading-snug text-ink">
                  {formatNight(booking.night, lang)}
                </div>
                <div className="break-words text-sm font-semibold">
                  {booking.requester_name}
                </div>
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
                onReject={onReject}
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
  onReject,
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
  onStartEdit,
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <DetailBlock label={copy.table.contact} value={`${booking.email}\n${booking.phone || copy.table.noPhone}`} />
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
        label={copy.details.internalNotes}
        value={booking.internal_notes || copy.details.noInternalNotes}
      />
      <DetailBlock label={copy.details.bookingId} value={booking.id} mono />
      <DetailBlock label={copy.details.accessToken} value={booking.access_token || copy.notSet} mono />
      <DetailBlock
        label={copy.details.language}
        value={(booking.lang === "en" ? "EN" : "DE")}
      />
      <DetailBlock label={copy.table.created} value={formatDateTime(booking.created_at, lang, copy.notSet)} />
      <DetailBlock label={copy.details.paymentNote} value={booking.payment_note || copy.details.noPaymentNote} />
      <DetailBlock label={copy.details.reviewed} value={formatDateTime(booking.reviewed_at, lang, copy.notSet)} />
      <DetailBlock label={copy.details.rentPaidAt} value={formatDateTime(booking.rent_paid_at, lang, copy.notSet)} />
      <DetailBlock label={copy.details.depositPaidAt} value={formatDateTime(booking.deposit_paid_at, lang, copy.notSet)} />
      <DetailBlock label={copy.details.signedAt} value={formatDateTime(booking.countersigned_at, lang, copy.notSet)} />
      <DetailBlock
        label={copy.details.signedPath}
        value={booking.signed_contract_path ? copy.details.yes : copy.details.no}
      />
      <DetailBlock
        label={copy.details.finalPath}
        value={booking.final_contract_path ? copy.details.yes : copy.details.no}
      />
      <PaymentActions
        booking={booking}
        busyKey={busyKey}
        copy={copy}
        onDownloadPaymentProof={onDownloadPaymentProof}
        onMarkPayment={onMarkPayment}
      />
      <SecondaryBookingActions
        booking={booking}
        busyKey={busyKey}
        copy={copy}
        onCancel={onCancel}
        onStartEdit={onStartEdit}
      />
      <ContractPanel
        booking={booking}
        busyKey={busyKey}
        copy={copy}
        onCountersign={onCountersign}
        onDownloadFile={onDownloadFile}
      />
    </div>
  );
}

function PaymentActions({
  booking,
  busyKey,
  copy,
  onDownloadPaymentProof,
  onMarkPayment,
}) {
  const busy = Boolean(busyKey);

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
      <div className="flex flex-wrap gap-2">
        {booking.payment_method === "online" && booking.rent_proof_path ? (
          <button
            className={compactButtonClass("secondary")}
            disabled={busy}
            onClick={() => onDownloadPaymentProof(booking)}
            type="button"
          >
            {copy.actions.downloadProof}
          </button>
        ) : null}
        {!booking.rent_paid ? (
          <button
            className={compactButtonClass("secondary")}
            disabled={busy}
            onClick={() => onMarkPayment(booking, "rent_paid")}
            type="button"
          >
            {copy.payment.markRent}
          </button>
        ) : null}
        {!booking.deposit_paid ? (
          <button
            className={compactButtonClass("secondary")}
            disabled={busy}
            onClick={() => onMarkPayment(booking, "deposit_paid")}
            type="button"
          >
            {copy.payment.markDeposit}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SecondaryBookingActions({ booking, busyKey, copy, onCancel, onStartEdit }) {
  const busy = Boolean(busyKey);
  const isClosed = booking.status === "rejected" || booking.status === "cancelled";

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
        {!isClosed ? (
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

function ContractPanel({ booking, busyKey, copy, onCountersign, onDownloadFile }) {
  const [file, setFile] = useState(null);
  const busy = Boolean(busyKey);
  const canCountersign = booking.status === "signed" && Boolean(booking.signed_contract_path);

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
              <button
                className={compactButtonClass("secondary")}
                disabled={busy}
                onClick={() => onDownloadFile(booking, "signed")}
                type="button"
              >
                {copy.actions.downloadSigned}
              </button>
            ) : null}
            {booking.final_contract_path ? (
              <button
                className={compactButtonClass("secondary")}
                disabled={busy}
                onClick={() => onDownloadFile(booking, "final")}
                type="button"
              >
                {copy.actions.downloadFinal}
              </button>
            ) : null}
          </div>
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
          "whitespace-pre-wrap break-words text-sm text-ink",
          mono ? "font-mono text-xs" : "",
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
