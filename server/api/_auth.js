import crypto from "node:crypto";

import { sendError } from "./_responses.js";

const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminPassword() {
  const { ADMIN_PASSWORD } = process.env;

  if (!ADMIN_PASSWORD) {
    throw new Error("Missing ADMIN_PASSWORD environment variable");
  }

  return ADMIN_PASSWORD;
}

function passwordDigest(value, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(String(value ?? ""), "utf8")
    .digest();
}

function timingSafeStringEqual(value, expected) {
  const valueBuffer = Buffer.from(String(value ?? ""), "utf8");
  const expectedBuffer = Buffer.from(String(expected ?? ""), "utf8");

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}

function signPayload(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64url");
}

export function verifyAdminPassword(password) {
  const secret = getAdminPassword();
  const providedDigest = passwordDigest(password, secret);
  const expectedDigest = passwordDigest(secret, secret);

  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

export function createAdminSessionToken(now = new Date()) {
  const secret = getAdminPassword();
  const issuedAt = now.getTime();
  const expiresAtMs = issuedAt + ADMIN_SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ v: 1, iat: issuedAt, exp: expiresAtMs }),
    "utf8"
  ).toString("base64url");
  const signature = signPayload(payload, secret);

  return {
    token: `${payload}.${signature}`,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

export function validateAdminSessionToken(token, now = new Date()) {
  if (typeof token !== "string" || token.trim() === "") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const secret = getAdminPassword();
  const expectedSignature = signPayload(payload, secret);

  if (!timingSafeStringEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const expiresAtMs = Number(session.exp);

    return (
      session.v === 1 &&
      Number.isFinite(expiresAtMs) &&
      expiresAtMs > now.getTime()
    );
  } catch {
    return false;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  const value = Array.isArray(header) ? header[0] : header;

  if (typeof value !== "string") return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function requireAdmin(req, res) {
  try {
    const token = getBearerToken(req);

    if (!token || !validateAdminSessionToken(token)) {
      sendError(req, res, 401, "unauthorized");
      return null;
    }

    return { token };
  } catch (error) {
    console.error("admin auth error", error);
    sendError(req, res, 500, "admin_auth_config");
    return null;
  }
}
