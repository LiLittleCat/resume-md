"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  applyKeyboardZoom,
  applyWheelZoom,
  clampPreviewScale,
  isZoomWheel,
  parseZoomKey,
} from "@/lib/preview-scale";

const HUD_MS = 900;

type GestureScaleEvent = Event & { scale: number; clientX?: number; clientY?: number };

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";
}

export function usePreviewZoom(containerRef: RefObject<HTMLElement | null>) {
  const previewScale = useEditorStore((state) => state.previewScale);
  const setPreviewScale = useEditorStore((state) => state.setPreviewScale);
  const [hudScale, setHudScale] = useState<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleRef = useRef(previewScale);
  const gestureOrigin = useRef(previewScale);
  const usingGesture = useRef(false);
  const anchorRef = useRef<{
    contentX: number;
    contentY: number;
    viewX: number;
    viewY: number;
    from: number;
  } | null>(null);

  useLayoutEffect(() => {
    scaleRef.current = previewScale;
    const container = containerRef.current;
    const anchor = anchorRef.current;
    if (!container || !anchor) return;
    const ratio = previewScale / anchor.from;
    container.scrollLeft = anchor.contentX * ratio - anchor.viewX;
    container.scrollTop = anchor.contentY * ratio - anchor.viewY;
    anchorRef.current = null;
  }, [containerRef, previewScale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const showHud = (scale: number) => {
      setHudScale(scale);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setHudScale(null), HUD_MS);
    };

    const commitScale = (next: number, clientX?: number, clientY?: number) => {
      const from = scaleRef.current;
      const clamped = clampPreviewScale(next);
      if (clamped !== from && clientX !== undefined && clientY !== undefined) {
        const rect = container.getBoundingClientRect();
        const viewX = clientX - rect.left;
        const viewY = clientY - rect.top;
        anchorRef.current = {
          contentX: container.scrollLeft + viewX,
          contentY: container.scrollTop + viewY,
          viewX,
          viewY,
          from,
        };
      } else {
        anchorRef.current = null;
      }
      scaleRef.current = clamped;
      setPreviewScale(clamped);
      showHud(clamped);
    };

    const onWheel = (event: WheelEvent) => {
      if (usingGesture.current) return;
      if (!isZoomWheel(event)) return;
      event.preventDefault();
      commitScale(
        applyWheelZoom(scaleRef.current, event.deltaY, event.deltaMode),
        event.clientX,
        event.clientY,
      );
    };

    const onGestureStart = (event: Event) => {
      event.preventDefault();
      usingGesture.current = true;
      gestureOrigin.current = scaleRef.current;
    };

    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as GestureScaleEvent;
      commitScale(gestureOrigin.current * gesture.scale, gesture.clientX, gesture.clientY);
    };

    const onGestureEnd = (event: Event) => {
      event.preventDefault();
      usingGesture.current = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const action = parseZoomKey(event);
      if (!action) return;
      event.preventDefault();
      commitScale(applyKeyboardZoom(scaleRef.current, action));
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("gesturestart", onGestureStart);
    container.addEventListener("gesturechange", onGestureChange);
    container.addEventListener("gestureend", onGestureEnd);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("gesturestart", onGestureStart);
      container.removeEventListener("gesturechange", onGestureChange);
      container.removeEventListener("gestureend", onGestureEnd);
      window.removeEventListener("keydown", onKeyDown);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [containerRef, setPreviewScale]);

  return hudScale;
}
