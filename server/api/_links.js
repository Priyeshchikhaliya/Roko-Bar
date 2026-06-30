const SITE_URL = (process.env.SITE_URL || "https://www.rokobar.de").replace(
  /\/+$/,
  ""
);

export function bookingPageUrl() {
  return `${SITE_URL}/booking`;
}

export function privateBookingUrl(token) {
  return `${SITE_URL}/booking/${token}`;
}
