import fs from "node:fs/promises";
import path from "node:path";

import {
  BANK_HOLDER,
  BANK_IBAN,
  BANK_NAME,
  DEPOSIT_AMOUNT,
  RESIDENT_RESIDENCIES,
} from "./_config.js";
import { sendError, sendJson } from "./_responses.js";

export const CONTRACT_BUCKET = "contracts";
export const PAYMENT_PROOF_BUCKET = "payment-proofs";
export const MAX_PDF_BYTES = 4 * 1024 * 1024;
export const MAX_PAYMENT_PROOF_BYTES = 4 * 1024 * 1024;
export const SIGNED_URL_TTL_SECONDS = 5 * 60;

const CONTRACT_FILES = {
  resident: "roko-bar-mietvertrag-75.pdf",
  external: "roko-bar-mietvertrag-100.pdf",
  rules: "roko-bar-hausordnung.pdf",
};

const CONTRACT_LABELS = {
  resident: "75 EUR resident contract / 75 EUR Bewohner:innen-Vertrag",
  external: "100 EUR external contract / 100 EUR externer Vertrag",
};

const BANK_CONFIG_WARNING_KEY = "__rokoBankConfigWarningLogged";

function contractsDir() {
  return path.join(process.cwd(), "public", "contracts");
}

function contentDisposition(filename) {
  return `attachment; filename="${filename}"`;
}

function getHeader(req, name) {
  const value = req.headers[name] || req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function parseBoundary(contentType) {
  if (typeof contentType !== "string") return null;
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return (match?.[1] || match?.[2] || "").trim() || null;
}

function parseDisposition(headerText) {
  const dispositionLine = headerText
    .split(/\r\n/)
    .find((line) => /^content-disposition:/i.test(line));

  if (!dispositionLine) return {};

  const name = dispositionLine.match(/\bname="([^"]*)"/i)?.[1] || "";
  const filename = dispositionLine.match(/\bfilename="([^"]*)"/i)?.[1] || "";

  return { filename, name };
}

function parsePartContentType(headerText) {
  const line = headerText
    .split(/\r\n/)
    .find((item) => /^content-type:/i.test(item));

  if (!line) return "";

  return normalizeContentType(line.split(":").slice(1).join(":"));
}

function normalizeContentType(value) {
  return String(value || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
}

function findMultipartFile(body, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`, "latin1");
  let boundaryStart = body.indexOf(boundaryBuffer);

  while (boundaryStart !== -1) {
    let partStart = boundaryStart + boundaryBuffer.length;

    if (body.slice(partStart, partStart + 2).toString("latin1") === "--") {
      break;
    }

    if (body.slice(partStart, partStart + 2).toString("latin1") === "\r\n") {
      partStart += 2;
    }

    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n", "latin1"), partStart);
    if (headerEnd === -1) break;

    const headerText = body.slice(partStart, headerEnd).toString("latin1");
    const { filename, name } = parseDisposition(headerText);
    const contentType = parsePartContentType(headerText);
    const contentStart = headerEnd + 4;
    const nextBoundaryStart = body.indexOf(
      Buffer.from(`\r\n--${boundary}`, "latin1"),
      contentStart
    );

    if (nextBoundaryStart === -1) break;

    if (filename) {
      return {
        buffer: body.slice(contentStart, nextBoundaryStart),
        contentType,
        filename,
        fieldName: name,
      };
    }

    boundaryStart = nextBoundaryStart + 2;
  }

  return null;
}

function parseMultipartParts(body, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`, "latin1");
  const parts = [];
  let boundaryStart = body.indexOf(boundaryBuffer);

  while (boundaryStart !== -1) {
    let partStart = boundaryStart + boundaryBuffer.length;

    if (body.slice(partStart, partStart + 2).toString("latin1") === "--") {
      break;
    }

    if (body.slice(partStart, partStart + 2).toString("latin1") === "\r\n") {
      partStart += 2;
    }

    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n", "latin1"), partStart);
    if (headerEnd === -1) break;

    const headerText = body.slice(partStart, headerEnd).toString("latin1");
    const { filename, name } = parseDisposition(headerText);
    const contentType = parsePartContentType(headerText);
    const contentStart = headerEnd + 4;
    const nextBoundaryStart = body.indexOf(
      Buffer.from(`\r\n--${boundary}`, "latin1"),
      contentStart
    );

    if (nextBoundaryStart === -1) break;

    const buffer = body.slice(contentStart, nextBoundaryStart);
    if (name) {
      parts.push({
        buffer,
        contentType,
        filename,
        fieldName: name,
      });
    }

    boundaryStart = nextBoundaryStart + 2;
  }

  return parts;
}

async function readRequestBuffer(req, maxBytes) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "latin1");

  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };

    req.on("data", (chunk) => {
      if (settled) return;

      const buffer = Buffer.from(chunk);
      total += buffer.length;

      if (total > maxBytes) {
        const error = new Error("The uploaded file is too large.");
        error.statusCode = 413;
        finish(reject, error);
        return;
      }

      chunks.push(buffer);
    });

    req.on("end", () => {
      finish(resolve, Buffer.concat(chunks));
    });

    req.on("error", (error) => {
      finish(reject, error);
    });
  });
}

export function contractTypeForResidency(residency) {
  return RESIDENT_RESIDENCIES.includes(residency) ? "resident" : "external";
}

export function contractFilenameForBooking(booking) {
  return CONTRACT_FILES[contractTypeForResidency(booking.residency)];
}

export function contractInfoForBooking(booking) {
  const type = contractTypeForResidency(booking.residency);

  return {
    type,
    filename: CONTRACT_FILES[type],
    label: CONTRACT_LABELS[type],
  };
}

export function sanitizeBookingForGuest(booking, now = new Date()) {
  const isExpired =
    booking.status === "approved" &&
    Boolean(booking.confirm_deadline) &&
    new Date(booking.confirm_deadline) <= now;

  return {
    id: booking.id,
    night: booking.night,
    status: isExpired ? "expired" : booking.status,
    isExpired,
    price: booking.price,
    deposit: DEPOSIT_AMOUNT,
    confirm_deadline: booking.confirm_deadline,
    contract: contractInfoForBooking(booking),
    hasSignedContract: Boolean(booking.signed_contract_path),
    hasFinalContract: Boolean(booking.final_contract_path),
    payment_method: booking.payment_method || null,
    hasRentProof: Boolean(booking.rent_proof_path),
    paymentReference: booking.id,
    bankDetails: bankDetailsForGuest(),
  };
}

function bankDetailsForGuest() {
  const missingRequired = [];
  const missingOptional = [];

  if (!BANK_IBAN) missingRequired.push("BANK_IBAN");
  if (!BANK_HOLDER) missingRequired.push("BANK_HOLDER");
  if (!BANK_NAME) missingOptional.push("BANK_NAME");

  if (
    !globalThis[BANK_CONFIG_WARNING_KEY] &&
    (missingRequired.length > 0 || missingOptional.length > 0)
  ) {
    const missing = [...missingRequired, ...missingOptional].join(", ");
    console.warn(
      `Rent bank details env incomplete: missing ${missing}. ` +
        "Restart the local/dev server after updating .env.local."
    );
    globalThis[BANK_CONFIG_WARNING_KEY] = true;
  }

  if (missingRequired.length > 0) return null;

  return {
    iban: BANK_IBAN,
    holder: BANK_HOLDER,
    name: BANK_NAME || null,
  };
}

export async function readLocalContractFile(filename) {
  return fs.readFile(path.join(contractsDir(), filename));
}

export async function readMultipartForm(req, { maxBytes, multipartCode, sizeCode }) {
  const contentType = getHeader(req, "content-type");
  const boundary = parseBoundary(contentType);

  if (!boundary) {
    return {
      code: multipartCode,
      statusCode: 400,
    };
  }

  const contentLength = Number(getHeader(req, "content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      code: sizeCode,
      statusCode: 413,
    };
  }

  let body;

  try {
    body = await readRequestBuffer(req, maxBytes);
  } catch (error) {
    return {
      code: error.statusCode === 413 ? sizeCode : "submit_failed",
      statusCode: error.statusCode || 400,
    };
  }

  const fields = {};
  const files = {};

  for (const part of parseMultipartParts(body, boundary)) {
    if (part.filename) {
      if (!files[part.fieldName]) files[part.fieldName] = [];
      files[part.fieldName].push(part);
      continue;
    }

    fields[part.fieldName] = part.buffer.toString("utf8").trim();
  }

  return { fields, files };
}

export function firstMultipartFile(files, fieldNames) {
  for (const fieldName of fieldNames) {
    const file = files?.[fieldName]?.[0];
    if (file) return file;
  }

  return null;
}

export async function approvalEmailAttachments(booking) {
  const contractFilename = contractFilenameForBooking(booking);

  const [contract, rules] = await Promise.all([
    readLocalContractFile(contractFilename),
    readLocalContractFile(CONTRACT_FILES.rules),
  ]);

  return [
    {
      filename: contractFilename,
      content: contract,
      content_type: "application/pdf",
    },
    {
      filename: CONTRACT_FILES.rules,
      content: rules,
      content_type: "application/pdf",
    },
  ];
}

export async function sendLocalContractPdf(res, filename) {
  const file = await readLocalContractFile(filename);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", file.length);
  res.setHeader("Content-Disposition", contentDisposition(filename));
  res.setHeader("Cache-Control", "private, no-store");
  res.end(file);
}

export async function readMultipartPdf(req) {
  const contentType = getHeader(req, "content-type");
  const boundary = parseBoundary(contentType);

  if (!boundary) {
    return {
      code: "signed_contract_upload_required",
      statusCode: 400,
    };
  }

  const contentLength = Number(getHeader(req, "content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_PDF_BYTES + 1024 * 1024) {
    return {
      code: "signed_contract_pdf_size",
      statusCode: 413,
    };
  }

  let body;

  try {
    body = await readRequestBuffer(req, MAX_PDF_BYTES + 1024 * 1024);
  } catch (error) {
    return {
      code: error.statusCode === 413 ? "signed_contract_pdf_size" : "submit_failed",
      statusCode: error.statusCode || 400,
    };
  }

  const file = findMultipartFile(body, boundary);

  if (!file || file.buffer.length === 0) {
    return { code: "signed_contract_missing", statusCode: 400 };
  }

  return validatePdfFile(file);
}

export function validatePdfFile(file) {
  if (!file || file.buffer.length === 0) {
    return { code: "signed_contract_missing", statusCode: 400 };
  }

  if (file.buffer.length > MAX_PDF_BYTES) {
    return {
      code: "signed_contract_pdf_size",
      statusCode: 413,
    };
  }

  if (!file.filename.toLowerCase().endsWith(".pdf")) {
    return { code: "signed_contract_pdf_type", statusCode: 400 };
  }

  if (
    file.contentType &&
    file.contentType !== "application/pdf" &&
    file.contentType !== "application/octet-stream"
  ) {
    return { code: "signed_contract_pdf_type", statusCode: 400 };
  }

  if (file.buffer.slice(0, 5).toString("latin1") !== "%PDF-") {
    return { code: "signed_contract_pdf_invalid", statusCode: 400 };
  }

  return { file };
}

function paymentProofExtension(file) {
  const filename = file.filename.toLowerCase();

  if (filename.endsWith(".pdf")) return "pdf";
  if (filename.endsWith(".png")) return "png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "jpg";

  return "";
}

function paymentProofContentType(file) {
  const extension = paymentProofExtension(file);
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "jpg") return "image/jpeg";

  return "";
}

function hasPaymentProofSignature(file) {
  const { buffer } = file;
  const extension = paymentProofExtension(file);

  if (extension === "pdf") {
    return buffer.slice(0, 5).toString("latin1") === "%PDF-";
  }

  if (extension === "png") {
    return buffer
      .slice(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (extension === "jpg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  return false;
}

export async function readMultipartPaymentProof(req) {
  const contentType = getHeader(req, "content-type");
  const boundary = parseBoundary(contentType);

  if (!boundary) {
    return {
      code: "proof_multipart_required",
      statusCode: 400,
    };
  }

  const contentLength = Number(getHeader(req, "content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_PAYMENT_PROOF_BYTES + 1024 * 1024
  ) {
    return {
      code: "proof_size",
      statusCode: 413,
    };
  }

  let body;

  try {
    body = await readRequestBuffer(req, MAX_PAYMENT_PROOF_BYTES + 1024 * 1024);
  } catch (error) {
    return {
      code: error.statusCode === 413 ? "proof_size" : "submit_failed",
      statusCode: error.statusCode || 400,
    };
  }

  const file = findMultipartFile(body, boundary);

  if (!file || file.buffer.length === 0) {
    return { code: "proof_missing", statusCode: 400 };
  }

  return validatePaymentProofFile(file);
}

export function validatePaymentProofFile(file) {
  if (!file || file.buffer.length === 0) {
    return { code: "proof_missing", statusCode: 400 };
  }

  if (file.buffer.length > MAX_PAYMENT_PROOF_BYTES) {
    return {
      code: "proof_size",
      statusCode: 413,
    };
  }

  const extension = paymentProofExtension(file);
  const normalizedContentType = paymentProofContentType(file);
  const allowedContentTypes = new Set([
    "application/pdf",
    "application/octet-stream",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ]);

  if (!extension || (file.contentType && !allowedContentTypes.has(file.contentType))) {
    return {
      code: "proof_type",
      statusCode: 400,
    };
  }

  if (!hasPaymentProofSignature(file)) {
    return {
      code: "proof_invalid",
      statusCode: 400,
    };
  }

  return {
    file: {
      ...file,
      contentType: normalizedContentType,
      extension,
    },
  };
}

export async function uploadPdfToContractBucket(supabase, storagePath, buffer) {
  const { error } = await supabase.storage
    .from(CONTRACT_BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw storageUploadError(error, CONTRACT_BUCKET);
}

export async function uploadPaymentProofToBucket(
  supabase,
  storagePath,
  buffer,
  contentType
) {
  const { error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw storageUploadError(error, PAYMENT_PROOF_BUCKET);
}

function storageUploadError(error, bucket) {
  const detail = error?.message || error?.error || "unknown storage error";
  const uploadError = new Error(`storage error: ${detail} (${bucket})`);
  uploadError.statusCode = 500;
  uploadError.publicMessage = uploadError.message;
  uploadError.cause = error;
  return uploadError;
}

export async function signedContractBucketUrl(supabase, storagePath, downloadName) {
  const options = downloadName ? { download: downloadName } : undefined;
  const { data, error } = await supabase.storage
    .from(CONTRACT_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS, options);

  if (error) throw error;

  return data.signedUrl;
}

export async function signedPaymentProofBucketUrl(
  supabase,
  storagePath,
  downloadName
) {
  const options = downloadName ? { download: downloadName } : undefined;
  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS, options);

  if (error) throw error;

  return data.signedUrl;
}

export function redirectToSignedUrl(res, signedUrl) {
  res.statusCode = 302;
  res.setHeader("Location", signedUrl);
  res.setHeader("Cache-Control", "private, no-store");
  res.end();
}

export function sendUploadValidationError(req, res, validation) {
  return sendError(req, res, validation.statusCode || 400, validation.code);
}

export function sendSpecificUploadError(res, error, fallback) {
  if (error?.publicMessage) {
    return sendJson(res, error.statusCode || 500, { error: error.publicMessage });
  }

  const message = error?.message || "";

  if (/Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/i.test(message)) {
    return sendJson(res, 500, {
      error: "missing config: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  if (error?.code || error?.details || error?.hint) {
    return sendJson(res, 500, {
      error: `database error: ${message || error.code}`,
    });
  }

  return sendJson(res, 500, { error: `${fallback}: ${message || "unknown error"}` });
}

export { CONTRACT_FILES };
