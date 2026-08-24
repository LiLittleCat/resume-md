import type { LocaleId, ResumeDate } from "../schema";

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const EN_MONTH_INDEX: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const PRESENT_RE = /^(至今|目前|现在|present|now|current|ongoing)$/i;

const ISO_DATE_RE = /^(\d{4})[./-](\d{1,2})(?:[./-](\d{1,2}))?$/;
const YEAR_RE = /^(\d{4})$/;
const EN_DATE_RE =
  /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{4})$/i;

const DATE_TOKEN_RE =
  /(?:\d{4}[./-]\d{1,2}(?:[./-]\d{1,2})?|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}|\d{4}|至今|目前|现在|Present|Now|Current|Ongoing)/i;

export function looksLikeDateRange(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parts = splitRange(trimmed);
  if (parts.length === 1) {
    return Boolean(parseDateToken(parts[0] ?? "").year || parseDateToken(parts[0] ?? "").present);
  }
  return parts.every((part) => {
    const parsed = parseDateToken(part);
    return Boolean(parsed.year || parsed.present);
  });
}

export function containsDateToken(value: string): boolean {
  return DATE_TOKEN_RE.test(value);
}

export function parseDateToken(token: string): ResumeDate {
  const raw = token.trim();
  if (!raw) return { raw };

  if (PRESENT_RE.test(raw)) {
    return { raw, present: true };
  }

  const iso = ISO_DATE_RE.exec(raw);
  if (iso) {
    return {
      raw,
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: iso[3] ? Number(iso[3]) : undefined,
    };
  }

  const en = EN_DATE_RE.exec(raw);
  if (en) {
    const month = EN_MONTH_INDEX[en[1]?.toLowerCase() ?? ""];
    return {
      raw,
      year: Number(en[2]),
      month,
    };
  }

  const year = YEAR_RE.exec(raw);
  if (year) {
    return { raw, year: Number(year[1]) };
  }

  return { raw };
}

export function parseDateRange(input: string): {
  start?: ResumeDate;
  end?: ResumeDate;
} {
  const parts = splitRange(input.trim());
  if (parts.length === 0) return {};
  if (parts.length === 1) {
    return { start: parseDateToken(parts[0] ?? "") };
  }
  return {
    start: parseDateToken(parts[0] ?? ""),
    end: parseDateToken(parts.slice(1).join(" - ")),
  };
}

export function formatDate(date: ResumeDate, locale: LocaleId, presentLabel: string): string {
  if (date.present) return presentLabel;
  if (date.year && date.month) {
    if (locale === "zh-CN") {
      return `${date.year}.${String(date.month).padStart(2, "0")}`;
    }
    return `${EN_MONTHS[date.month - 1]} ${date.year}`;
  }
  if (date.year) return String(date.year);
  return date.raw;
}

export function formatDateRange(
  start: ResumeDate | undefined,
  end: ResumeDate | undefined,
  locale: LocaleId,
  presentLabel: string,
): string {
  if (!start && !end) return "";
  if (start && !end) return formatDate(start, locale, presentLabel);
  if (!start && end) return formatDate(end, locale, presentLabel);
  return `${formatDate(start!, locale, presentLabel)} - ${formatDate(end!, locale, presentLabel)}`;
}

function splitRange(value: string): string[] {
  return value
    .replace(/\s*[~～–—]\s*/g, " - ")
    .replace(/\s+至\s+/g, " - ")
    .split(/\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
