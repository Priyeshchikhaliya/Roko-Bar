import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

const MAX_MONTH_OFFSET = 12;
const DEPOSIT_AMOUNT = 200;
const RESIDENCY_PRICES = {
  roko: 75,
  christophorusweg: 75,
  rosenbachweg: 75,
  external: 100,
};
const BOOKABLE_WEEKDAYS = new Set([5, 6]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()./-]{7,25}$/;

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return PHONE_RE.test(value) && digits.length >= 7 && digits.length <= 15;
}

const emptyForm = {
  requester_name: "",
  email: "",
  phone: "",
  address: "",
  residency: "",
  guest_count: "",
  additional_info: "",
  payment_method: "",
};

function getUtcToday() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function startOfUtcMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date, amount) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
  );
}

function addUtcDays(date, amount) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount),
  );
}

function toIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

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

function isSameUtcMonth(date, monthDate) {
  return (
    date.getUTCFullYear() === monthDate.getUTCFullYear() &&
    date.getUTCMonth() === monthDate.getUTCMonth()
  );
}

function isBookableWeekday(date) {
  return BOOKABLE_WEEKDAYS.has(date.getUTCDay());
}

function isFutureBookableDate(date, today) {
  return date.getTime() > today.getTime() && isBookableWeekday(date);
}

function buildMonthCells(monthDate) {
  const monthStart = startOfUtcMonth(monthDate);
  const mondayOffset = (monthStart.getUTCDay() + 6) % 7;
  const gridStart = addUtcDays(monthStart, -mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addUtcDays(gridStart, index);
    return {
      date,
      iso: toIsoDate(date),
      day: date.getUTCDate(),
      inMonth: isSameUtcMonth(date, monthStart),
    };
  });
}

function formatDateLabel(iso, locale) {
  const date = parseIsoDate(iso);
  if (!date) return iso;

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatMonthLabel(date, locale) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatMoney(amount, locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Booking() {
  const { lang, t } = useLanguage();
  const page = t.booking;
  const locale = t.common.htmlLang === "de" ? "de-DE" : "en-GB";
  const today = useMemo(() => getUtcToday(), []);
  const minMonth = useMemo(() => startOfUtcMonth(today), [today]);
  const maxMonth = useMemo(
    () => addUtcMonths(minMonth, MAX_MONTH_OFFSET),
    [minMonth],
  );
  const [visibleMonth, setVisibleMonth] = useState(minMonth);
  const [availability, setAvailability] = useState({ taken: [], pending: [] });
  const [availabilityStatus, setAvailabilityStatus] = useState("idle");
  const [selectedNight, setSelectedNight] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState(null);
  const [successDetails, setSuccessDetails] = useState(null);

  const takenDates = useMemo(
    () => new Set(availability.taken),
    [availability.taken],
  );
  const pendingDates = useMemo(
    () => new Set(availability.pending),
    [availability.pending],
  );

  const loadAvailability = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setAvailabilityStatus("loading");
    }

    try {
      const response = await fetch("/api/availability", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Could not load availability.");
      }

      const data = await response.json();
      setAvailability({
        taken: Array.isArray(data.taken) ? data.taken : [],
        pending: Array.isArray(data.pending) ? data.pending : [],
      });
      setAvailabilityStatus("ready");
    } catch {
      setAvailabilityStatus("error");
    }
  }, []);

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    if (selectedNight && takenDates.has(selectedNight)) {
      setSelectedNight("");
    }
  }, [selectedNight, takenDates]);

  const canGoPrevious = visibleMonth.getTime() > minMonth.getTime();
  const canGoNext = visibleMonth.getTime() < maxMonth.getTime();
  const selectedDate = selectedNight ? parseIsoDate(selectedNight) : null;
  const hasValidSelectedNight =
    Boolean(selectedDate) &&
    isFutureBookableDate(selectedDate, today) &&
    !takenDates.has(selectedNight);

  const selectNight = (iso) => {
    setSelectedNight(iso);
    setFieldErrors((current) => ({ ...current, night: undefined }));
    setSubmitMessage(null);

    // On stacked (mobile/tablet) layouts the form is below the calendar, so a
    // tap can feel like nothing happened. Bring the form into view. On the
    // side-by-side desktop layout it is already visible, so leave scroll alone.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      window.requestAnimationFrame(() => {
        document
          .getElementById("booking-request")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitMessage(null);
  };

  // Friendlier feedback: validate a single field once the user leaves it,
  // instead of waiting for a full submit.
  const handleFieldBlur = (event) => {
    const { name } = event.target;
    const value = event.target.value.trim();
    let error;

    if (name === "requester_name") {
      if (!value) error = page.errors.nameRequired;
    } else if (name === "email") {
      if (!value) error = page.errors.emailRequired;
      else if (!EMAIL_RE.test(value)) error = page.errors.emailInvalid;
    } else if (name === "phone") {
      if (!value) error = page.errors.phoneRequired;
      else if (!isValidPhone(value)) error = page.errors.phoneInvalid;
    } else if (name === "address") {
      if (!value) error = page.errors.addressRequired;
    }

    if (error) {
      setFieldErrors((current) => ({ ...current, [name]: error }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const selectedDateForValidation = selectedNight
      ? parseIsoDate(selectedNight)
      : null;

    if (!selectedNight) {
      nextErrors.night = page.errors.dateRequired;
    } else if (
      !selectedDateForValidation ||
      !isFutureBookableDate(selectedDateForValidation, today)
    ) {
      nextErrors.night = page.errors.dateInvalid;
    } else if (takenDates.has(selectedNight)) {
      nextErrors.night = page.errors.dateTaken;
    }

    if (!formData.requester_name.trim()) {
      nextErrors.requester_name = page.errors.nameRequired;
    }

    if (!formData.email.trim()) {
      nextErrors.email = page.errors.emailRequired;
    } else if (!EMAIL_RE.test(formData.email.trim())) {
      nextErrors.email = page.errors.emailInvalid;
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = page.errors.phoneRequired;
    } else if (!isValidPhone(formData.phone.trim())) {
      nextErrors.phone = page.errors.phoneInvalid;
    }

    if (!formData.address.trim()) {
      nextErrors.address = page.errors.addressRequired;
    }

    if (!Object.hasOwn(RESIDENCY_PRICES, formData.residency)) {
      nextErrors.residency = page.errors.residencyRequired;
    }

    if (formData.guest_count) {
      const guestCount = Number(formData.guest_count);
      if (!Number.isInteger(guestCount) || guestCount <= 0) {
        nextErrors.guest_count = page.errors.guestCountInvalid;
      }
    }

    if (!acceptedTerms) {
      nextErrors.terms = page.errors.termsRequired;
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (!validateForm()) return;

    setSubmitStatus("sending");

    const payload = {
      night: selectedNight,
      requester_name: formData.requester_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      residency: formData.residency,
      guest_count: formData.guest_count ? Number(formData.guest_count) : null,
      additional_info: formData.additional_info.trim(),
      payment_method: formData.payment_method || null,
      lang,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Language": lang,
          "Content-Type": "application/json",
          "X-Roko-Lang": lang,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setSuccessDetails({
          id: data.id,
          price: data.price,
          deposit: data.deposit,
          night: selectedNight,
          email: formData.email.trim(),
        });
        setSubmitStatus("success");
        await loadAvailability({ silent: true });
        return;
      }

      if (response.status === 409) {
        setSubmitStatus("idle");
        setSelectedNight("");
        setFieldErrors((current) => ({
          ...current,
          night: page.errors.conflictField,
        }));
        setSubmitMessage({
          type: "warning",
          text: page.errors.conflict,
        });
        await loadAvailability({ silent: true });
        return;
      }

      setSubmitStatus("idle");
      setSubmitMessage({
        type: "error",
        text: data.error || page.errors.genericSubmit,
      });
    } catch {
      setSubmitStatus("idle");
      setSubmitMessage({
        type: "error",
        text: page.errors.network,
      });
    }
  };

  const resetForm = () => {
    setSelectedNight("");
    setFormData(emptyForm);
    setAcceptedTerms(false);
    setFieldErrors({});
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setSuccessDetails(null);
  };

  const selectedRent = RESIDENCY_PRICES[formData.residency];
  const isFormComplete =
    hasValidSelectedNight &&
    acceptedTerms &&
    submitStatus !== "sending" &&
    Boolean(formData.requester_name.trim()) &&
    EMAIL_RE.test(formData.email.trim()) &&
    isValidPhone(formData.phone.trim()) &&
    Boolean(formData.address.trim()) &&
    Object.hasOwn(RESIDENCY_PRICES, formData.residency);

  const scrollToForm = () => {
    document
      .getElementById("booking-request")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitFromStickyBar = () => {
    if (isFormComplete) {
      handleSubmit({ preventDefault: () => {} });
    } else {
      scrollToForm();
    }
  };

  const showStickyBar = submitStatus !== "success" && Boolean(selectedNight);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.booking} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.common.badges.booking}</p>
            <h1 className="hero-title max-w-4xl">{page.title}</h1>
          </div>
          <p className="lead max-w-2xl">{page.intro}</p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <span className="accent-rule" />
            <h2 className="section-title max-w-3xl">{page.recapTitle}</h2>
            <p className="lead">
              {page.processReference}{" "}
              <Link
                to={t.common.links.home}
                className="underline underline-offset-4"
              >
                {page.processLink}
              </Link>
            </p>
          </div>

          <ul className="grid gap-px border border-line bg-line">
            {page.recapPoints.map((point) => (
              <li key={point} className="bg-surface p-5 md:p-6">
                <div className="flex gap-4">
                  <span className="square-bullet" />
                  <span className="leading-relaxed text-muted">{point}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:items-start">
            <AvailabilityCalendar
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              locale={locale}
              maxMonth={maxMonth}
              minMonth={minMonth}
              onMonthChange={setVisibleMonth}
              onRetry={loadAvailability}
              onSelect={selectNight}
              page={page}
              pendingDates={pendingDates}
              selectedNight={selectedNight}
              status={availabilityStatus}
              takenDates={takenDates}
              today={today}
              visibleMonth={visibleMonth}
            />

            <BookingRequestForm
              acceptedTerms={acceptedTerms}
              fieldErrors={fieldErrors}
              formData={formData}
              hasValidSelectedNight={hasValidSelectedNight}
              locale={locale}
              onAcceptedTermsChange={(event) => {
                setAcceptedTerms(event.target.checked);
                setFieldErrors((current) => ({ ...current, terms: undefined }));
                setSubmitMessage(null);
              }}
              onFieldBlur={handleFieldBlur}
              onFieldChange={updateField}
              onReset={resetForm}
              onSubmit={handleSubmit}
              page={page}
              selectedNight={selectedNight}
              submitMessage={submitMessage}
              submitStatus={submitStatus}
              successDetails={successDetails}
              termsHref={t.common.links.terms}
            />
          </div>
          {showStickyBar ? (
            <div className="h-24 lg:hidden" aria-hidden="true" />
          ) : null}
        </div>
      </section>

      {showStickyBar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
          <div className="container-wide flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">
                {formatDateLabel(selectedNight, locale)}
              </p>
              <p className="truncate text-sm font-semibold text-primary">
                {selectedRent
                  ? `${formatMoney(selectedRent + DEPOSIT_AMOUNT, locale)} ${
                      page.form.stickyTotal
                    }`
                  : page.form.stickyChoosePrompt}
              </p>
            </div>
            <button
              type="button"
              disabled={submitStatus === "sending"}
              className="btn-primary min-h-12 shrink-0 px-5 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={submitFromStickyBar}
            >
              {submitStatus === "sending"
                ? page.form.sending
                : isFormComplete
                  ? page.form.submit
                  : page.form.stickyContinue}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AvailabilityCalendar({
  canGoNext,
  canGoPrevious,
  locale,
  maxMonth,
  minMonth,
  onMonthChange,
  onRetry,
  onSelect,
  page,
  pendingDates,
  selectedNight,
  status,
  takenDates,
  today,
  visibleMonth,
}) {
  const cells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const monthLabel = formatMonthLabel(visibleMonth, locale);

  const isSelectableCell = useCallback(
    (cell) =>
      cell.inMonth &&
      isFutureBookableDate(cell.date, today) &&
      !takenDates.has(cell.iso),
    [takenDates, today],
  );

  const selectableDates = useMemo(
    () => cells.filter(isSelectableCell).map((cell) => cell.iso),
    [cells, isSelectableCell],
  );

  const focusDate = (iso) => {
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-calendar-date="${iso}"]`)?.focus();
    });
  };

  const moveFocus = (fromIso, amount) => {
    const currentDate = parseIsoDate(fromIso);
    if (!currentDate) return;

    let nextDate = addUtcDays(currentDate, amount);
    let attempts = 0;

    while (isSameUtcMonth(nextDate, visibleMonth) && attempts < 31) {
      const candidate = {
        date: nextDate,
        iso: toIsoDate(nextDate),
        inMonth: true,
      };

      if (isSelectableCell(candidate)) {
        focusDate(candidate.iso);
        return;
      }

      nextDate = addUtcDays(nextDate, amount);
      attempts += 1;
    }
  };

  const handleDayKeyDown = (event, iso) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(iso, -1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(iso, 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(iso, -7);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(iso, 7);
      return;
    }

    if (event.key === "Home" && selectableDates.length > 0) {
      event.preventDefault();
      focusDate(selectableDates[0]);
      return;
    }

    if (event.key === "End" && selectableDates.length > 0) {
      event.preventDefault();
      focusDate(selectableDates[selectableDates.length - 1]);
    }
  };

  const goToPreviousMonth = () => {
    onMonthChange((current) => {
      const previousMonth = addUtcMonths(current, -1);
      return previousMonth.getTime() < minMonth.getTime()
        ? current
        : previousMonth;
    });
  };

  const goToNextMonth = () => {
    onMonthChange((current) => {
      const nextMonth = addUtcMonths(current, 1);
      return nextMonth.getTime() > maxMonth.getTime() ? current : nextMonth;
    });
  };

  return (
    <section className="flat-panel space-y-6" aria-labelledby="booking-calendar">
      <div className="space-y-4">
        <span className="accent-rule" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">{page.calendarTitle}</p>
            <h2 id="booking-calendar" className="font-display text-4xl font-semibold">
              {page.calendar.heading}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border border-line bg-surface text-lg font-semibold text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-muted"
              disabled={!canGoPrevious}
              onClick={goToPreviousMonth}
              title={page.calendar.previousMonth}
              aria-label={page.calendar.previousMonth}
            >
              <span aria-hidden="true">{"<"}</span>
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border border-line bg-surface text-lg font-semibold text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-muted"
              disabled={!canGoNext}
              onClick={goToNextMonth}
              title={page.calendar.nextMonth}
              aria-label={page.calendar.nextMonth}
            >
              <span aria-hidden="true">{">"}</span>
            </button>
          </div>
        </div>
        <p className="lead text-base">{page.calendarNote}</p>
      </div>

      {status === "loading" || status === "idle" ? (
        <div className="border border-line bg-surface p-6" role="status">
          <p className="font-semibold">{page.calendar.loadingTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {page.calendar.loadingText}
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="border border-danger bg-surface p-6" role="alert">
          <p className="font-semibold text-danger">{page.calendar.errorTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {page.calendar.errorText}
          </p>
          <button type="button" className="btn-secondary mt-5" onClick={onRetry}>
            {page.calendar.retry}
          </button>
        </div>
      ) : null}

      {status === "ready" ? (
        <>
          <div className="border border-line bg-surface p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p
                className="font-display text-2xl font-semibold capitalize sm:text-3xl"
                aria-live="polite"
              >
                {monthLabel}
              </p>
              {selectedNight ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:text-right">
                  {page.calendar.selectedPrefix}{" "}
                  {formatDateLabel(selectedNight, locale)}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-7 gap-px bg-line text-center text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">
              {page.calendar.weekdays.map((day) => (
                <div key={day} className="bg-surface px-1 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-line">
              {cells.map((cell) => (
                <CalendarCell
                  cell={cell}
                  isSelected={cell.iso === selectedNight}
                  isSelectable={isSelectableCell(cell)}
                  key={cell.iso}
                  locale={locale}
                  onKeyDown={handleDayKeyDown}
                  onSelect={onSelect}
                  page={page}
                  pendingDates={pendingDates}
                  takenDates={takenDates}
                  today={today}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted">
            {page.calendar.legend.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <span
                  className={[
                    "h-3 w-3 border",
                    item.status === "free"
                      ? "border-line bg-surface"
                      : "border-transparent",
                    item.status === "pending" ? "bg-warning" : "",
                    item.status === "taken" ? "bg-danger" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function CalendarCell({
  cell,
  isSelected,
  isSelectable,
  locale,
  onKeyDown,
  onSelect,
  page,
  pendingDates,
  takenDates,
  today,
}) {
  if (!cell.inMonth) {
    return <div className="aspect-square bg-paper" aria-hidden="true" />;
  }

  const isPast = cell.date.getTime() <= today.getTime();
  const isTaken = takenDates.has(cell.iso);
  const isPending = pendingDates.has(cell.iso);
  const isMuted = !isFutureBookableDate(cell.date, today) && !isTaken;
  const isToday = cell.date.getTime() === today.getTime();
  const todayClass = isToday ? "ring-1 ring-inset ring-ink/45" : "";
  const stateLabel = isTaken
    ? page.calendar.states.taken
    : isPending
      ? page.calendar.states.pending
      : isSelectable
        ? page.calendar.states.free
        : isPast
          ? page.calendar.states.past
          : page.calendar.states.unavailable;
  const cellLabel = `${formatDateLabel(cell.iso, locale)}: ${stateLabel}`;
  const baseClass =
    "flex aspect-square min-h-11 w-full flex-col overflow-hidden p-1.5 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-14 sm:p-2";
  const stateClass = isSelected
    ? "bg-primary text-surface"
      : isTaken
        ? "cursor-not-allowed bg-danger text-surface"
      : isPending
        ? "bg-warning text-ink"
        : isSelectable
          ? "bg-surface text-ink hover:bg-brick-tint"
          : isMuted
            ? "bg-paper text-muted"
            : "bg-paper text-muted";

  if (!isSelectable) {
    return (
      <div
        className={`${baseClass} ${stateClass} ${todayClass}`}
        aria-disabled="true"
        aria-label={cellLabel}
        role="gridcell"
      >
        <span className="block font-semibold leading-none">{cell.day}</span>
        {isTaken ? (
          <span className="mt-1 hidden max-w-full truncate text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.08em] text-surface/85 sm:block">
            {page.calendar.takenHint}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${baseClass} ${stateClass}`}
      aria-label={cellLabel}
      aria-pressed={isSelected}
      data-calendar-date={cell.iso}
      onClick={() => onSelect(cell.iso)}
      onKeyDown={(event) => onKeyDown(event, cell.iso)}
    >
      <span className="block font-semibold leading-none">{cell.day}</span>
      {isPending ? (
        <>
          <span
            className={`mt-1 hidden max-w-full truncate text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.08em] sm:block ${
              isSelected ? "text-surface/85" : "text-ink/75"
            }`}
          >
            {page.calendar.requestedHint}
          </span>
          <span
            className={`mt-1 h-1.5 w-1.5 shrink-0 sm:hidden ${
              isSelected ? "bg-surface/85" : "bg-ink/70"
            }`}
            aria-hidden="true"
          />
        </>
      ) : null}
    </button>
  );
}

function BookingRequestForm({
  acceptedTerms,
  fieldErrors,
  formData,
  hasValidSelectedNight,
  locale,
  onAcceptedTermsChange,
  onFieldBlur,
  onFieldChange,
  onReset,
  onSubmit,
  page,
  selectedNight,
  submitMessage,
  submitStatus,
  successDetails,
  termsHref,
}) {
  const selectedDateLabel = selectedNight
    ? formatDateLabel(selectedNight, locale)
    : page.form.noNightSelected;
  const selectedRent = RESIDENCY_PRICES[formData.residency];
  const isSending = submitStatus === "sending";
  const isSuccess = submitStatus === "success";
  const submitDisabled = isSending || !acceptedTerms || !hasValidSelectedNight;

  if (isSuccess && successDetails) {
    return (
      <section className="flat-panel space-y-6" aria-labelledby="booking-success">
        <span className="accent-rule" />
        <div className="space-y-4">
          <p className="eyebrow">{page.success.eyebrow}</p>
          <h2 id="booking-success" className="font-display text-4xl font-semibold">
            {page.success.title}
          </h2>
          <p className="lead text-base">{page.success.body}</p>
          <p className="border-l border-primary pl-4 text-sm leading-relaxed text-muted">
            {page.success.notConfirmed}
          </p>
        </div>

        <dl className="grid gap-px border border-line bg-line sm:grid-cols-3">
          <div className="bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {page.success.dateLabel}
            </dt>
            <dd className="mt-2 font-semibold">
              {formatDateLabel(successDetails.night, locale)}
            </dd>
          </div>
          <div className="bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {page.form.rentLabel}
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold text-primary">
              {formatMoney(successDetails.price, locale)}
            </dd>
          </div>
          <div className="bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {page.form.depositLabel}
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold text-primary">
              {formatMoney(successDetails.deposit, locale)}
            </dd>
          </div>
        </dl>

        <div className="space-y-4 border-t border-line pt-6">
          <h3 className="text-xl font-semibold">{page.success.nextTitle}</h3>
          <ol className="grid gap-3">
            {page.success.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-xs font-bold text-surface">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted">{step}</span>
              </li>
            ))}
          </ol>
          {successDetails.email ? (
            <p className="text-sm leading-relaxed text-muted">
              {page.success.emailNote.replace("{email}", successDetails.email)}
            </p>
          ) : null}
        </div>

        <button type="button" className="btn-secondary w-fit" onClick={onReset}>
          {page.success.newRequest}
        </button>
      </section>
    );
  }

  return (
    <form
      id="booking-request"
      className="flat-panel space-y-7 font-sans scroll-mt-4"
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="booking-form-title"
    >
      <div className="space-y-4">
        <span className="accent-rule" />
        <div className="space-y-2">
          <p className="eyebrow">{page.form.eyebrow}</p>
          <h2 id="booking-form-title" className="font-display text-4xl font-semibold">
            {page.form.title}
          </h2>
        </div>
      </div>

      <div className="grid gap-6">
        <FormField error={fieldErrors.night} id="booking-night" label={page.form.nightLabel}>
          <input
            id="booking-night"
            className="form-input w-full px-3 py-2.5"
            readOnly
            value={selectedDateLabel}
            aria-describedby={
              fieldErrors.night
                ? "booking-night-error"
                : !selectedNight
                  ? "booking-night-hint"
                  : undefined
            }
          />
          {!selectedNight ? (
            <p id="booking-night-hint" className="mt-2 text-sm text-muted">
              {page.form.noNightHint}
            </p>
          ) : null}
        </FormField>

        <fieldset className="m-0 space-y-5 border-0 p-0">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {page.form.sectionContact}
          </legend>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              error={fieldErrors.requester_name}
              id="requester_name"
              label={page.form.nameLabel}
              required
            >
              <input
                id="requester_name"
                name="requester_name"
                className="form-input w-full px-3 py-2.5"
                value={formData.requester_name}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                required
                autoComplete="name"
                aria-invalid={fieldErrors.requester_name ? "true" : undefined}
                aria-describedby={
                  fieldErrors.requester_name
                    ? "requester_name-error"
                    : undefined
                }
              />
            </FormField>

            <FormField
              error={fieldErrors.email}
              id="email"
              label={page.form.emailLabel}
              required
            >
              <input
                id="email"
                name="email"
                type="email"
                className="form-input w-full px-3 py-2.5"
                value={formData.email}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                required
                autoComplete="email"
                aria-invalid={fieldErrors.email ? "true" : undefined}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              error={fieldErrors.phone}
              id="phone"
              label={page.form.phoneLabel}
              required
            >
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input w-full px-3 py-2.5"
                value={formData.phone}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                required
                autoComplete="tel"
                aria-invalid={fieldErrors.phone ? "true" : undefined}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              />
            </FormField>

            <FormField
              error={fieldErrors.address}
              id="address"
              label={page.form.addressLabel}
              required
            >
              <input
                id="address"
                name="address"
                className="form-input w-full px-3 py-2.5"
                value={formData.address}
                onChange={onFieldChange}
                onBlur={onFieldBlur}
                required
                autoComplete="street-address"
                aria-invalid={fieldErrors.address ? "true" : undefined}
                aria-describedby={fieldErrors.address ? "address-error" : undefined}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="m-0 space-y-5 border-0 p-0">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {page.form.sectionEvent}
          </legend>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              error={fieldErrors.residency}
              id="residency"
              label={page.form.residencyLabel}
              required
            >
              <select
                id="residency"
                name="residency"
                className="form-select w-full px-3 py-2.5"
                value={formData.residency}
                onChange={onFieldChange}
                required
                aria-invalid={fieldErrors.residency ? "true" : undefined}
                aria-describedby={
                  fieldErrors.residency ? "residency-error" : undefined
                }
              >
                <option value="">{page.form.residencyPlaceholder}</option>
                {page.form.residencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.residency === "rosenbachweg" ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {page.form.rosenbachwegNote}
                </p>
              ) : null}
            </FormField>

            <FormField
              error={fieldErrors.guest_count}
              id="guest_count"
              label={page.form.guestCountLabel}
            >
              <input
                id="guest_count"
                name="guest_count"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                className="form-input w-full px-3 py-2.5"
                value={formData.guest_count}
                onChange={onFieldChange}
                aria-invalid={fieldErrors.guest_count ? "true" : undefined}
                aria-describedby={
                  fieldErrors.guest_count ? "guest_count-error" : undefined
                }
              />
            </FormField>
          </div>

          <PriceDisplay locale={locale} page={page} rent={selectedRent} />

          <FormField
            error={fieldErrors.payment_method}
            id="payment_method"
            label={page.form.paymentMethodLabel}
          >
            <select
              id="payment_method"
              name="payment_method"
              className="form-select w-full px-3 py-2.5"
              value={formData.payment_method}
              onChange={onFieldChange}
            >
              <option value="">{page.form.paymentMethodPlaceholder}</option>
              {page.form.paymentMethods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {page.form.paymentMethodHint}
            </p>
          </FormField>

          <FormField
            error={fieldErrors.additional_info}
            id="additional_info"
            label={page.form.additionalInfoLabel}
          >
            <textarea
              id="additional_info"
              name="additional_info"
              className="form-textarea min-h-32 w-full px-3 py-2.5"
              value={formData.additional_info}
              onChange={onFieldChange}
              rows={5}
            />
          </FormField>
        </fieldset>

        <p className="text-xs text-muted">{page.form.requiredHint}</p>
      </div>

      <section className="space-y-5 border-t border-line pt-7">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">{page.agreement.title}</h3>
          <ul className="grid gap-3 text-sm text-muted">
            {page.agreement.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="square-bullet" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              className="mt-1 h-4 w-4 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              type="checkbox"
              checked={acceptedTerms}
              onChange={onAcceptedTermsChange}
              required
              aria-invalid={fieldErrors.terms ? "true" : undefined}
              aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
            />
            <span>
              {page.form.termsPrefix}{" "}
              <a
                href={termsHref}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-4"
              >
                {page.form.termsLink}
              </a>
              {page.form.termsSuffix}
            </span>
          </label>
          {fieldErrors.terms ? (
            <p id="terms-error" className="text-sm text-danger">
              {fieldErrors.terms}
            </p>
          ) : null}
        </div>
      </section>

      {submitMessage ? (
        <div
          className={`border p-4 text-sm leading-relaxed ${
            submitMessage.type === "warning"
              ? "border-warning bg-surface text-ink"
              : "border-danger bg-surface text-ink"
          }`}
          role="alert"
        >
          {submitMessage.text}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          {!hasValidSelectedNight
            ? page.form.submitNeedsDate
            : !acceptedTerms
              ? page.form.submitNeedsTerms
              : page.form.submitReady}
        </p>
        <button
          type="submit"
          className="btn-primary w-full disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted sm:w-fit"
          disabled={submitDisabled}
        >
          {isSending ? page.form.sending : page.form.submit}
        </button>
      </div>
    </form>
  );
}

function FormField({ children, error, id, label, required = false }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PriceDisplay({ locale, page, rent }) {
  if (!rent) {
    return (
      <div className="border border-line bg-paper p-4">
        <h3 className="text-sm font-semibold">{page.form.priceTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {page.form.priceChooseResidency}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper p-4" aria-live="polite">
      <h3 className="text-sm font-semibold">{page.form.priceTitle}</h3>
      <dl className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {page.form.rentLabel}
          </dt>
          <dd className="mt-2 font-display text-3xl font-semibold text-primary">
            {formatMoney(rent, locale)}
          </dd>
        </div>
        <div className="bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {page.form.depositLabel}
          </dt>
          <dd className="mt-2 font-display text-3xl font-semibold text-primary">
            {formatMoney(DEPOSIT_AMOUNT, locale)}
          </dd>
        </div>
        <div className="bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {page.form.totalLabel}
          </dt>
          <dd className="mt-2 font-display text-3xl font-semibold text-primary">
            {formatMoney(rent + DEPOSIT_AMOUNT, locale)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {page.form.depositNote}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {page.form.priceSourceNote}
      </p>
    </div>
  );
}
