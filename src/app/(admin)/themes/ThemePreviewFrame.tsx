"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function previewBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return (
    process.env.NEXT_PUBLIC_ADMIN_BASE_URL ||
    process.env.ADMIN_BASE_URL ||
    "http://127.0.0.1:3000"
  ).replace(/\/$/, "");
}

export function ThemePreviewFrame({
  payload,
}: {
  payload: Record<string, unknown> | null;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const src = `${previewBaseUrl()}/preview/theme`;

  const postPayload = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !payload) return;
    win.postMessage({ type: "SV_THEME_PREVIEW", payload }, "*");
  }, [payload]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "SV_THEME_PREVIEW_READY") {
        setReady(true);
        postPayload();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postPayload]);

  useEffect(() => {
    if (ready) postPayload();
  }, [ready, postPayload]);

  return (
    <div className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[#f3f0ea]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-white px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Live preview
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {ready ? "Synced" : "Loading renderer…"}
        </span>
      </div>
      <iframe
        ref={iframeRef}
        title="Theme preview"
        src={src}
        className="h-full min-h-[600px] w-full flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

export const ThemePreviewFrame = ThemePreviewFrame;
