"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { setFrontMatterAvatar } from "@/core/parser";
import type { AvatarPosition, AvatarShape } from "@/core/schema";
import { useUi } from "@/components/editor/use-ui";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { readAvatarFile } from "@/lib/avatar-file";
import { Field, Segmented } from "./controls";

export function AvatarField({
  avatar,
  position,
  shape,
}: {
  avatar?: string;
  position: AvatarPosition;
  shape: AvatarShape;
}) {
  const source = useEditorStore((state) => state.source);
  const setSource = useEditorStore((state) => state.setSource);
  const patchConfig = useEditorStore((state) => state.patchConfig);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const ui = useUi();

  const applyFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await readAvatarFile(file);
      setSource(setFrontMatterAvatar(source, dataUrl));
    } catch {
      toast.error(ui.avatarInvalid);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => void applyFile(event.target.files?.[0])}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="size-12 shrink-0 overflow-hidden border border-border bg-muted/60"
          style={{ borderRadius: shape === "circle" ? "999px" : "6px" }}
          aria-label={avatar ? ui.avatarChange : ui.avatarUpload}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {avatar ? (
            <span
              className="block size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${JSON.stringify(avatar)})` }}
            />
          ) : (
            <span className="block size-full bg-muted" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {avatar ? ui.avatarChange : ui.avatarUpload}
          </Button>
          {avatar ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={busy}
              onClick={() => setSource(setFrontMatterAvatar(source, null))}
            >
              {ui.avatarRemove}
            </Button>
          ) : null}
        </div>
      </div>
      {avatar ? (
        <>
          <Field label={ui.avatarPosition}>
            <Segmented<AvatarPosition>
              value={position}
              onChange={(next) => patchConfig({ avatar: { position: next } })}
              options={[
                { value: "left", label: ui.avatarPositions.left },
                { value: "center", label: ui.avatarPositions.center },
                { value: "right", label: ui.avatarPositions.right },
              ]}
            />
          </Field>
          <Field label={ui.avatarShape}>
            <Segmented<AvatarShape>
              value={shape}
              onChange={(next) => patchConfig({ avatar: { shape: next } })}
              options={[
                { value: "square", label: ui.avatarShapes.square },
                { value: "circle", label: ui.avatarShapes.circle },
              ]}
            />
          </Field>
        </>
      ) : null}
    </div>
  );
}
