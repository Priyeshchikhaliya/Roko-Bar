export const PAYMENT_METHODS = ["cash", "online"];

export function normalizePaymentMethod(value, { nullable = true } = {}) {
  if (value === undefined || value === null || value === "") {
    return nullable ? null : "";
  }

  const method = String(value).trim().toLowerCase();
  return PAYMENT_METHODS.includes(method) ? method : "";
}
