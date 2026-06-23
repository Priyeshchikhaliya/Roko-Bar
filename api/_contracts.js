import fs from "node:fs/promises";
import path from "node:path";

import {
  DEPOSIT_AMOUNT,
  RESIDENT_RESIDENCIES,
} from "./_config.js";
import { sendJson } from "./_responses.js";

export const CONTRACT_BUCKET = "contracts";
export const MAX_PDF_BYTES = 4 * 1024 * 1024;
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

  return line.split(":").slice(1).join(":").trim().toLowerCase();
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
    night: booking.night,
    status: isExpired ? "expired" : booking.status,
    isExpired,
    price: booking.price,
    deposit: DEPOSIT_AMOUNT,
    confirm_deadline: booking.confirm_deadline,
    contract: contractInfoForBooking(booking),
    hasSignedContract: Boolean(booking.signed_contract_path),
    hasFinalContract: Boolean(booking.final_contract_path),
  };
}

export async function readLocalContractFile(filename) {
  return fs.readFile(path.join(contractsDir(), filename));
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
      error: "Upload must use multipart/form-data with a PDF file.",
      statusCode: 400,
    };
  }

  const contentLength = Number(getHeader(req, "content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_PDF_BYTES + 1024 * 1024) {
    return {
      error: `PDF must be ${Math.floor(MAX_PDF_BYTES / 1024 / 1024)} MB or smaller.`,
      statusCode: 413,
    };
  }

  let body;

  try {
    body = await readRequestBuffer(req, MAX_PDF_BYTES + 1024 * 1024);
  } catch (error) {
    return {
      error:
        error.statusCode === 413
          ? `PDF must be ${Math.floor(MAX_PDF_BYTES / 1024 / 1024)} MB or smaller.`
          : "Could not read upload.",
      statusCode: error.statusCode || 400,
    };
  }

  const file = findMultipartFile(body, boundary);

  if (!file || file.buffer.length === 0) {
    return { error: "Upload must include a PDF file.", statusCode: 400 };
  }

  if (file.buffer.length > MAX_PDF_BYTES) {
    return {
      error: `PDF must be ${Math.floor(MAX_PDF_BYTES / 1024 / 1024)} MB or smaller.`,
      statusCode: 413,
    };
  }

  if (!file.filename.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are accepted.", statusCode: 400 };
  }

  if (file.contentType && file.contentType !== "application/pdf") {
    return { error: "Only PDF files are accepted.", statusCode: 400 };
  }

  if (file.buffer.slice(0, 5).toString("latin1") !== "%PDF-") {
    return { error: "Uploaded file is not a valid PDF.", statusCode: 400 };
  }

  return { file };
}

export async function uploadPdfToContractBucket(supabase, storagePath, buffer) {
  const { error } = await supabase.storage
    .from(CONTRACT_BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;
}

export async function signedContractBucketUrl(supabase, storagePath, downloadName) {
  const { data, error } = await supabase.storage
    .from(CONTRACT_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS, {
      download: downloadName,
    });

  if (error) throw error;

  return data.signedUrl;
}

export function redirectToSignedUrl(res, signedUrl) {
  res.statusCode = 302;
  res.setHeader("Location", signedUrl);
  res.setHeader("Cache-Control", "private, no-store");
  res.end();
}

export function sendUploadValidationError(res, validation) {
  return sendJson(res, validation.statusCode || 400, { error: validation.error });
}

export { CONTRACT_FILES };
