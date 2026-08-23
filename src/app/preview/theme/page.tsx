"use client";

import { useEffect, useState } from "react";
import { EventThemeRenderer } from "@/themes";
import styles from "./preview.module.css";

export default function ThemePreviewPage() {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let id: number | undefined;

    function announceReady() {
      window.parent?.postMessage({ type: "SV_THEME_PREVIEW_READY" }, "*");
    }

    function onMessage(event: MessageEvent) {
      if (event.data?.type === "SV_THEME_PREVIEW_REQUEST") {
        announceReady();
        return;
      }
      if (event.data?.type !== "SV_THEME_PREVIEW") return;
      setPayload((event.data.payload as Record<string, unknown>) ?? null);
      if (id != null) {
        window.clearInterval(id);
        id = undefined;
      }
    }

    window.addEventListener("message", onMessage);
    announceReady();
    id = window.setInterval(announceReady, 1000);

    return () => {
      window.removeEventListener("message", onMessage);
      if (id != null) window.clearInterval(id);
    };
  }, []);

  const event = payload?.event as Record<string, unknown> | undefined;

  if (!event) {
    return (
      <div className={styles.waiting}>
        <p>Theme preview</p>
        <span>Adjust settings on the left to see the live render.</span>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Dancing+Script&family=Great+Vibes&family=Josefin+Sans:wght@400;600&family=Lobster&family=Lora:wght@500;600&family=Oswald:wght@500&family=Pacifico&family=Peddana&family=Pinyon+Script&family=Playfair+Display:wght@500;600;700&family=Poppins:wght@400;500;600&family=Ramabhadra&family=Tangerine:wght@400;700&display=swap"
      />
      <div className={styles.frame}>
        <EventThemeRenderer
          event={event}
          youtube={payload?.youtube}
          media={(payload?.media as unknown[]) ?? []}
          branding={payload?.branding}
          theme={payload?.theme}
          publicPath={(payload?.publicPath as string) ?? "/event/draft"}
        />
      </div>
    </>
  );
}
