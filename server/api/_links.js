const PUBLIC_ORIGIN = "https://www.rokobar.de";

// A localhost SITE_URL in production is worse than no SITE_URL at all: every
// mailed link then resolves to the guest's own device, so they see a browser
// connection error instead of their booking, and nothing on our side fails
// loudly enough to notice. That is exactly how it went wrong once, because
// .env.example and the local setup instructions both show the localhost value
// and it got copied into the Vercel production environment.
//
// So in production a local-looking origin is ignored in favour of the real one
// and reported. Outside production it is honoured, because pointing at
// localhost is the whole point of running locally.
function resolveSiteUrl() {
  const configured = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");

  if (!configured) return PUBLIC_ORIGIN;

  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(
    configured
  );

  if (isLocal && process.env.VERCEL_ENV === "production") {
    console.error(
      `SITE_URL is set to ${configured} in production; guest links would be ` +
        `unreachable. Falling back to ${PUBLIC_ORIGIN}. Fix the Vercel ` +
        `production environment variable.`
    );
    return PUBLIC_ORIGIN;
  }

  return configured;
}

const SITE_URL = resolveSiteUrl();

export function bookingPageUrl() {
  return `${SITE_URL}/booking`;
}

export function privateBookingUrl(token) {
  return `${SITE_URL}/booking/${token}`;
}
