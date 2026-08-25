import { z } from "zod";
import { parseResumeMarkdown } from "@/core/parser";
import { ResumeConfigSchema, type ResumeConfig, type ThemeId } from "@/core/schema";
import {
  EDITOR_STORAGE_KEY,
  LEGACY_EDITOR_STORAGE_KEY,
  type ColorSchemePreference,
} from "@/lib/color-scheme";

export { EDITOR_STORAGE_KEY, LEGACY_EDITOR_STORAGE_KEY };

export const RESUME_LIBRARY_VERSION = 4 as const;

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ResumeDocumentRecord {
  id: string;
  source: string;
  config: ResumeConfig;
  createdAt: number;
  updatedAt: number;
}

export interface ResumeChrome {
  colorScheme: ColorSchemePreference;
  leftPanelWidth?: number;
  rightPanelWidth?: number;
}

export interface ResumeLibrary {
  version: typeof RESUME_LIBRARY_VERSION;
  activeId: string | null;
  chrome: ResumeChrome;
  documents: Record<string, ResumeDocumentRecord>;
}

export interface SeedInput {
  source: string;
  config: ResumeConfig;
  id?: string;
  now?: number;
}

export type PersistResult = { ok: true } | { ok: false; reason: "quota" | "unknown" };

const DocumentRecordSchema = z.object({
  id: z.string().min(1),
  source: z.string(),
  config: ResumeConfigSchema.catch({}),
  createdAt: z.number().finite(),
  updatedAt: z.number().finite(),
});

export function newResumeId(): string {
  return crypto.randomUUID();
}

export function withDocumentLocale(source: string, config: ResumeConfig): ResumeConfig {
  if (config.locale) return config;
  const parsed = parseResumeMarkdown(source);
  return { ...config, locale: parsed.frontMatter.locale ?? parsed.resume.locale };
}

export function resumeDocumentName(source: string, unnamed: string): string {
  const name = parseResumeMarkdown(source).resume.profile.name.trim();
  return name || unnamed;
}

export function resumeDocumentRole(source: string): string {
  return parseResumeMarkdown(source).resume.profile.title?.trim() ?? "";
}

export function resumeDocumentTheme(config: ResumeConfig): ThemeId {
  return config.theme ?? "minimal";
}

export function seedLibrary(seed: SeedInput): ResumeLibrary {
  const now = seed.now ?? Date.now();
  const id = seed.id ?? newResumeId();
  const source = seed.source;
  const config = withDocumentLocale(source, seed.config);
  return {
    version: RESUME_LIBRARY_VERSION,
    activeId: id,
    chrome: { colorScheme: "system" },
    documents: {
      [id]: { id, source, config, createdAt: now, updatedAt: now },
    },
  };
}

export function emptyLibrary(chrome?: ResumeChrome): ResumeLibrary {
  return {
    version: RESUME_LIBRARY_VERSION,
    activeId: null,
    chrome: chrome ?? { colorScheme: "system" },
    documents: {},
  };
}

export function listResumeDocuments(library: ResumeLibrary): ResumeDocumentRecord[] {
  return Object.values(library.documents).sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
    return b.createdAt - a.createdAt;
  });
}

export function createResumeDocument(
  library: ResumeLibrary,
  input: {
    source: string;
    config: ResumeConfig;
    id?: string;
    now?: number;
    activate?: boolean;
  },
): { library: ResumeLibrary; id: string } {
  const id = input.id ?? newResumeId();
  const now = input.now ?? Date.now();
  const source = input.source;
  const config = withDocumentLocale(source, input.config);
  const document: ResumeDocumentRecord = { id, source, config, createdAt: now, updatedAt: now };
  return {
    id,
    library: {
      ...library,
      activeId: input.activate === false ? library.activeId : id,
      documents: { ...library.documents, [id]: document },
    },
  };
}

export function duplicateResumeDocument(
  library: ResumeLibrary,
  id: string,
  input?: { id?: string; now?: number },
): { library: ResumeLibrary; id: string } | null {
  const current = library.documents[id];
  if (!current) return null;
  return createResumeDocument(library, {
    source: current.source,
    config: current.config,
    id: input?.id,
    now: input?.now,
    activate: false,
  });
}

export function deleteResumeDocument(library: ResumeLibrary, id: string): ResumeLibrary {
  if (!library.documents[id]) return library;
  const documents = { ...library.documents };
  delete documents[id];
  const activeId = library.activeId === id ? mostRecentId(documents) : library.activeId;
  return { ...library, documents, activeId };
}

export function setActiveResume(library: ResumeLibrary, id: string): ResumeLibrary {
  if (!library.documents[id]) return library;
  return { ...library, activeId: id };
}

export function updateResumeDocument(
  library: ResumeLibrary,
  id: string,
  patch: { source?: string; config?: ResumeConfig },
  now = Date.now(),
): ResumeLibrary {
  const current = library.documents[id];
  if (!current) return library;
  return {
    ...library,
    documents: {
      ...library.documents,
      [id]: {
        ...current,
        source: patch.source ?? current.source,
        config: patch.config ?? current.config,
        updatedAt: now,
      },
    },
  };
}

export function updateResumeChrome(
  library: ResumeLibrary,
  chrome: Partial<ResumeChrome>,
): ResumeLibrary {
  return { ...library, chrome: { ...library.chrome, ...chrome } };
}

export function persistResumeLibrary(store: KeyValueStore, library: ResumeLibrary): PersistResult {
  try {
    store.setItem(EDITOR_STORAGE_KEY, JSON.stringify(library));
    return { ok: true };
  } catch (error) {
    if (isQuotaError(error)) return { ok: false, reason: "quota" };
    return { ok: false, reason: "unknown" };
  }
}

export function hydrateResumeLibrary(store: KeyValueStore, seed: SeedInput): ResumeLibrary {
  const parsedV4 = parseV4(store.getItem(EDITOR_STORAGE_KEY));
  if (parsedV4) {
    const repaired = repairLibrary(parsedV4);
    if (repaired.changed) persistResumeLibrary(store, repaired.library);
    return repaired.library;
  }

  const migrated = parseLegacyLibrary(store.getItem(LEGACY_EDITOR_STORAGE_KEY), seed);
  const library = migrated ?? seedLibrary(seed);
  persistResumeLibrary(store, library);
  return library;
}

function parseV4(raw: string | null): ResumeLibrary | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const envelope = parsed as Record<string, unknown>;
    if (envelope.version !== RESUME_LIBRARY_VERSION) return null;
    const documents = parseDocuments(envelope.documents);
    const chrome = parseChrome(envelope.chrome);
    const activeId = typeof envelope.activeId === "string" ? envelope.activeId : null;
    return { version: RESUME_LIBRARY_VERSION, activeId, chrome, documents };
  } catch {
    return null;
  }
}

function parseLegacyLibrary(raw: string | null, seed: SeedInput): ResumeLibrary | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.source !== "string" || parsed.source.length === 0) return null;
    const configResult = ResumeConfigSchema.safeParse(parsed.config ?? {});
    const source = parsed.source;
    const config = withDocumentLocale(source, configResult.success ? configResult.data : {});
    const id = seed.id ?? newResumeId();
    const now = seed.now ?? Date.now();
    return {
      version: RESUME_LIBRARY_VERSION,
      activeId: id,
      chrome: {
        colorScheme: parseColorScheme(parsed.colorScheme),
        leftPanelWidth: asFiniteNumber(parsed.leftPanelWidth),
        rightPanelWidth: asFiniteNumber(parsed.rightPanelWidth),
      },
      documents: {
        [id]: { id, source, config, createdAt: now, updatedAt: now },
      },
    };
  } catch {
    return null;
  }
}

function parseDocuments(value: unknown): Record<string, ResumeDocumentRecord> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const documents: Record<string, ResumeDocumentRecord> = {};
  for (const raw of Object.values(value as Record<string, unknown>)) {
    const parsed = DocumentRecordSchema.safeParse(raw);
    if (!parsed.success) continue;
    documents[parsed.data.id] = parsed.data;
  }
  return documents;
}

function parseChrome(value: unknown): ResumeChrome {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { colorScheme: "system" };
  }
  const chrome = value as Record<string, unknown>;
  return {
    colorScheme: parseColorScheme(chrome.colorScheme),
    leftPanelWidth: asFiniteNumber(chrome.leftPanelWidth),
    rightPanelWidth: asFiniteNumber(chrome.rightPanelWidth),
  };
}

function parseColorScheme(value: unknown): ColorSchemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function repairLibrary(library: ResumeLibrary): { library: ResumeLibrary; changed: boolean } {
  let changed = false;
  const activeId =
    library.activeId && library.documents[library.activeId]
      ? library.activeId
      : mostRecentId(library.documents);
  if (activeId !== library.activeId) changed = true;
  return { library: changed ? { ...library, activeId } : library, changed };
}

function mostRecentId(documents: Record<string, ResumeDocumentRecord>): string | null {
  const latest = listResumeDocuments({
    version: RESUME_LIBRARY_VERSION,
    activeId: null,
    chrome: { colorScheme: "system" },
    documents,
  })[0];
  return latest?.id ?? null;
}

function isQuotaError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}
