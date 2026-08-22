"use client";

import { useMemo, useState, useCallback } from "react";
import {
  coverSrc,
  formatEventDateTime,
  youtubeEmbedUrl,
} from "../lib/event-helpers";
import { buildEventShareText, resolveEventShareImageUrl, shareEventWithImage } from "../lib/share-event";
import { resolveThemeSections, shouldShowLivePlayer } from "../lib/theme-sections";
import styles from "./EventThemeShell.module.css";

const FALLBACK_COLORS = {
  primary: "#C77B3E",
  secondary: "#F3D9C0",
  accent: "#8A5A2E",
  background: "#0B0908",
  text: "#F7F1E6",
  fontFamily: "Georgia, serif",
};

function resolveLayout(theme) {
  return theme?.config?.layout || theme?.slug || "cinematic";
}

function isLightTheme(colors) {
  const bg = String(colors.background || "").toLowerCase();
  return bg.includes("#f") || bg.includes("#fff") || bg.includes("250") || bg.includes("248");
}

export default function EventThemeShell({
  event,
  youtube,
  media = [],
  branding,
  theme,
  publicPath,
}) {
  const layout = resolveLayout(theme);
  const colors = { ...FALLBACK_COLORS, ...(theme?.config?.colors || {}) };
  const sections = useMemo(() => resolveThemeSections(theme), [theme]);

  const [watching, setWatching] = useState(true);
  const embed = useMemo(() => youtubeEmbedUrl(youtube), [youtube]);
  const showLive = shouldShowLivePlayer(sections, youtube, embed, event);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  const title = event?.pageTitle || event?.eventName || "Live Event";
  const fontFamily =
    event?.fontFamily || theme?.config?.fontFamily || branding?.customConfig?.fontFamily || colors.fontFamily;
  const accent = event?.fontColor || branding?.primaryColor || colors.primary;
  const cover = coverSrc(event?.coverImage);
  const logo = branding?.logo || event?.logoImage;
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : publicPath || "";
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);
  const light = isLightTheme(colors);
  const shareImageUrl = useMemo(() => resolveEventShareImageUrl(event), [event]);
  const shareText = useMemo(
    () =>
      buildEventShareText({
        url: shareUrl,
        title,
        tagline: event?.scrollMessage || `Watch live: ${title}`,
        placeLine: event?.location || event?.eventPlace || null,
      }),
    [shareUrl, title, event?.scrollMessage, event?.location, event?.eventPlace]
  );
  const shareInvite = useCallback(
    async (e) => {
      e?.preventDefault?.();
      await shareEventWithImage({
        url: shareUrl,
        text: shareText,
        imageUrl: shareImageUrl || cover,
        title,
        fileName: "event-share.png",
      });
    },
    [shareUrl, shareText, shareImageUrl, cover, title]
  );

  return (
    <div
      className={`${styles.root} ${styles[layout] || ""} ${light ? styles.light : styles.dark}`}
      style={{
        "--theme-primary": accent,
        "--theme-secondary": colors.secondary,
        "--theme-accent": colors.accent || accent,
        "--theme-bg": colors.background,
        "--theme-text": colors.text,
        "--theme-font": fontFamily,
      }}
    >
      <div className={styles.bgGlow} aria-hidden />
      <div className={styles.bgCover} style={{ backgroundImage: `url(${cover})` }} aria-hidden />

      {event?.scrollMessage ? (
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            <span>{event.scrollMessage}</span>
            <span>{event.scrollMessage}</span>
          </div>
        </div>
      ) : null}

      <header className={styles.topBar}>
        <div className={styles.brand}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className={styles.logo} />
          ) : (
            <span className={styles.brandMark}>SV Live</span>
          )}
          {branding?.companyName ? <span className={styles.host}>{branding.companyName}</span> : null}
        </div>
        {isLive ? (
          <div className={styles.livePill}>
            <span className={styles.liveDot} />
            LIVE
          </div>
        ) : (
          <div className={styles.soonPill}>UPCOMING</div>
        )}
      </header>

      <main className={styles.stage}>
        <p className={styles.eyebrow}>{(event?.eventType || "Event").toUpperCase()}</p>
        <h1 className={styles.title}>{title}</h1>
        {event?.liveTiming ? (
          <p className={styles.timing}>{event.liveTiming}</p>
        ) : (
          <p className={styles.timing}>
            {formatEventDateTime(event?.eventDate, event?.startTime)}
            {event?.location ? ` · ${event.location}` : ""}
          </p>
        )}

        <div className={styles.playerShell}>
          {showLive ? (
            watching && embed ? (
              <iframe
                src={embed}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.player}
              />
            ) : (
              <button
                type="button"
                className={styles.poster}
                onClick={() => setWatching(true)}
                style={{ backgroundImage: `url(${event?.customImage || cover})` }}
              >
                <span className={styles.posterShade} />
                <span className={styles.watchBtn}>
                  {embed ? "Watch Live" : "Stream starting soon"}
                </span>
              </button>
            )
          ) : cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className={styles.coverOnly} />
          ) : null}
        </div>

        <div className={styles.actions}>
          {showLive && embed && event?.showWatchLive !== false ? (
            <button type="button" className={styles.primaryBtn} onClick={() => setWatching(true)}>
              {watching ? "Playing" : "Watch Live"}
            </button>
          ) : null}
          {event?.showSocialShare !== false && shareUrl ? (
            <button type="button" className={styles.secondaryBtn} onClick={shareInvite}>
              Share event
            </button>
          ) : null}
        </div>

        {(event?.remarks1 || event?.remarks2 || event?.description) && (
          <div className={styles.notes}>
            {event.description ? <p>{event.description}</p> : null}
            {event.remarks1 ? <p>{event.remarks1}</p> : null}
            {event.remarks2 ? <p>{event.remarks2}</p> : null}
          </div>
        )}

        {sections.showGallery !== false && gallery.length > 0 ? (
          <section className={styles.gallery}>
            <h2>Moments</h2>
            <div className={styles.galleryGrid}>
              {gallery.map((item) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id || item.fileUrl} src={item.thumbnailUrl || item.fileUrl} alt="" />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className={styles.footer}>
        Powered by SV Live · Theme: {theme?.name || layout}
        {event?.location ? ` · ${event.location}` : ""}
      </footer>
    </div>
  );
}
