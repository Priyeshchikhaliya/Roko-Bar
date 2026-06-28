export class TutorConfigError extends Error {
  constructor(message, code = "tutors_invalid") {
    super(message);
    this.name = "TutorConfigError";
    this.code = code;
  }
}

function parseTutors(rawValue) {
  if (!rawValue?.trim()) {
    return {
      error: new TutorConfigError(
        "Tutor assignment is not configured: TUTORS is missing.",
        "tutors_missing",
      ),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return {
      error: new TutorConfigError(
        "Tutor assignment is not configured: TUTORS must be valid JSON.",
        "tutors_invalid_json",
      ),
    };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return {
      error: new TutorConfigError(
        "Tutor assignment is not configured: TUTORS must be a non-empty array.",
      ),
    };
  }

  const names = new Set();
  const tutors = [];

  for (const entry of parsed) {
    const name = typeof entry?.name === "string" ? entry.name.trim() : "";
    const rawWhatsApp = typeof entry?.wa === "string" ? entry.wa.trim() : "";
    const whatsapp = rawWhatsApp.replace(/\D/g, "");

    if (!name || name.length > 80 || /[\r\n]/.test(name) || names.has(name)) {
      return {
        error: new TutorConfigError(
          "Tutor assignment is not configured: tutor names must be non-empty and unique.",
        ),
      };
    }

    if (
      !/^\+?[\d\s()./-]+$/.test(rawWhatsApp) ||
      whatsapp.length < 7 ||
      whatsapp.length > 15
    ) {
      return {
        error: new TutorConfigError(
          `Tutor assignment is not configured: WhatsApp number for ${name} is invalid.`,
        ),
      };
    }

    names.add(name);
    tutors.push(Object.freeze({ name, wa: whatsapp }));
  }

  return { tutors: Object.freeze(tutors) };
}

const tutorConfig = parseTutors(process.env.TUTORS);

export function getTutors() {
  if (tutorConfig.error) throw tutorConfig.error;
  return tutorConfig.tutors;
}

export function getTutorByName(name) {
  return getTutors().find((tutor) => tutor.name === name) || null;
}
