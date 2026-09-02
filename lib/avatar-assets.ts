import {
  compileResume,
  type CompiledResume,
  type CompileResumeInput,
} from "@/core/compile";
import { parseResumeMarkdown, setFrontMatterAvatar } from "@/core/parser";

export const AVATAR_REFERENCE_PREFIX = "resume-avatar://";
const AVATAR_STORAGE_KEY_PREFIX = "resume-md:avatar:";

export interface AvatarAssetStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ExternalizedAvatarSource {
  source: string;
  changed: boolean;
  reference?: string;
}

export function createAvatarReference(id = crypto.randomUUID()): string {
  return `${AVATAR_REFERENCE_PREFIX}${id}`;
}

export function storeAvatarAsset(
  store: AvatarAssetStore,
  dataUrl: string,
  id?: string,
): string {
  const reference = createAvatarReference(id);
  const storageKey = avatarStorageKey(reference);
  if (!storageKey) throw new Error("Invalid avatar reference");
  store.setItem(storageKey, dataUrl);
  return reference;
}

export function resolveAvatarAsset(
  avatar: string | undefined,
  store: Pick<AvatarAssetStore, "getItem">,
): string | undefined {
  if (!avatar) return undefined;
  const storageKey = avatarStorageKey(avatar);
  if (!storageKey) return avatar;
  return store.getItem(storageKey) ?? undefined;
}

export function externalizeAvatarSource(
  source: string,
  store: AvatarAssetStore,
  id?: string,
): ExternalizedAvatarSource {
  const avatar = parseResumeMarkdown(source).resume.profile.avatar;
  if (!avatar?.startsWith("data:image/")) return { source, changed: false };

  const reference = storeAvatarAsset(store, avatar, id);
  return {
    source: setFrontMatterAvatar(source, reference),
    changed: true,
    reference,
  };
}

export function materializeAvatarSource(
  source: string,
  store: Pick<AvatarAssetStore, "getItem">,
): string | null {
  const avatar = parseResumeMarkdown(source).resume.profile.avatar;
  const storageKey = avatarStorageKey(avatar);
  if (!storageKey) return source;

  const resolved = store.getItem(storageKey);
  return resolved ? setFrontMatterAvatar(source, resolved) : null;
}

export function compileResumeWithAvatarAssets(
  input: CompileResumeInput,
  store: Pick<AvatarAssetStore, "getItem">,
): CompiledResume {
  const compiled = compileResume(input);
  const currentAvatar = compiled.resume.profile.avatar;
  const avatar = resolveAvatarAsset(currentAvatar, store);
  if (avatar === currentAvatar) return compiled;

  return {
    ...compiled,
    resume: {
      ...compiled.resume,
      profile: {
        ...compiled.resume.profile,
        avatar,
      },
    },
  };
}

function avatarStorageKey(avatar: string | undefined): string | null {
  if (!avatar?.startsWith(AVATAR_REFERENCE_PREFIX)) return null;
  const id = avatar.slice(AVATAR_REFERENCE_PREFIX.length);
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return null;
  return `${AVATAR_STORAGE_KEY_PREFIX}${id}`;
}
