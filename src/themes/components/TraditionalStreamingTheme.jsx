"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  coverSrc,
  formatEventDate,
  formatEventDateTime,
  resolveCountdownTarget,
  youtubeEmbedUrl,
} from "../lib/event-helpers";
import {
  buildEventShareText,
  resolveEventShareImageUrl,
  shareEventWithImage,
} from "../lib/share-event";
import { resolveThemeSections, shouldShowLivePlayer } from "../lib/theme-sections";
import styles from "./TraditionalStreamingTheme.module.css";

const DEFAULT_ASSET = "/themes/traditional-streaming";
const DEFAULT_TAGLINE = "ప్రత్యక్ష ప్రసారానికి స్వాగతం";
const DEFAULT_SCROLL = "స్వాగతం — ప్రత్యక్ష ప్రసారం త్వరలో ప్రారంభమవుతుంది";

function pad(n) {
  return String(n).padStart(2, "0");
}

function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!targetIso) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  return useMemo(() => {
    if (!targetIso) return null;
    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) return null;
    const diff = target - now;
    if (diff <= 0) return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      ended: false,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [targetIso, now]);
}

function formatTimeLabel(event) {
  if (event?.liveTiming) return event.liveTiming;
  if (event?.eventTime) return event.eventTime;
  return null;
}

export default function TraditionalStreamingTheme({
  event,
  youtube,
  media = [],
  branding,
  theme,
  publicPath,
}) {
  const assetBase = theme?.config?.assetPath || DEFAULT_ASSET;
  const colors = theme?.config?.colors || {};
  const sections = useMemo(() => resolveThemeSections(theme), [theme]);
  const [watching, setWatching] = useState(true);
  const embed = useMemo(() => youtubeEmbedUrl(youtube), [youtube]);
  const showLive = shouldShowLivePlayer(sections, youtube, embed, event);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  const title = event?.pageTitle || event?.eventName || "Live Event";
  const fontFamily =
    event?.fontFamily || theme?.config?.fontFamily || "Cormorant Garamond, Georgia, serif";
  const accent = event?.fontColor || branding?.primaryColor || colors.primary || "#B8860A";
  const maroon = colors.secondary || "#7A1626";
  const cover = coverSrc(event?.coverImage);
  const logo = branding?.logo || event?.logoImage;
  const shareUrl = typeof window !== "undefined" ? window.location.href : publicPath || "";
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);
  const tagline = theme?.config?.defaults?.tagline || DEFAULT_TAGLINE;
  const scrollMessage = event?.scrollMessage || theme?.config?.defaults?.scrollMessage || DEFAULT_SCROLL;
  const dateInfo = formatEventDate(event?.eventDate);
  const timeLabel = formatTimeLabel(event);
  const countdownTarget = resolveCountdownTarget(event);
  const countdown = useCountdown(sections.showCountdown !== false ? countdownTarget : null);
  const shareImageUrl = useMemo(() => resolveEventShareImageUrl(event), [event]);
  const shareText = useMemo(
    () =>
      buildEventShareText({
        url: shareUrl,
        title,
        tagline: scrollMessage,
        placeLine: event?.location || event?.eventPlace || null,
      }),
    [shareUrl, title, scrollMessage, event?.location, event?.eventPlace]
  );
  const shareInvite = useCallback(
    async (e) => {
      e?.preventDefault?.();
      await shareEventWithImage({
        url: shareUrl,
        text: shareText,
        imageUrl: shareImageUrl || cover,
        title,
        fileName: "live-event-share.png",
      });
    },
    [shareUrl, shareText, shareImageUrl, cover, title]
  );

  return (
    <div
      className={styles.root}
      style={{
        "--ts-accent": accent,
        "--ts-maroon": maroon,
        "--ts-font": fontFamily,
        "--ts-bg": colors.background || "#FBF6EC",
        "--ts-text": colors.text || "#5A4A2E",
      }}
    >
      <link rel="stylesheet" href={`${assetBase.replace(/\/$/, "")}/style.css`} />

      <div className={styles.bgTexture} aria-hidden />
      <div className={styles.bgCover} style={{ backgroundImage: `url(${cover})` }} aria-hidden />

      <div className={styles.toranWrap} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${assetBase}/assets/toran.svg`} alt="" className={styles.toran} />
      </div>

      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          <span>{scrollMessage}</span>
          <span>{scrollMessage}</span>
        </div>
      </div>

      <header className={styles.topBar}>
        <div className={styles.brand}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className={styles.logo} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${assetBase}/assets/namaste.svg`} alt="" className={styles.logoIcon} />
          )}
          {branding?.companyName ? (
            <span className={styles.host}>{branding.companyName}</span>
          ) : null}
        </div>
        {isLive ? (
          <div className={styles.livePill}>
            <span className={styles.liveDot} />
            LIVE · ప్రత్యక్షం
          </div>
        ) : (
          <div className={styles.soonPill}>త్వరలో ప్రారంభం</div>
        )}
      </header>

      <main className={styles.stage}>
        <div className={styles.flourishRow} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${assetBase}/assets/gold-flourish.svg`} alt="" className={styles.flourish} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${assetBase}/assets/lotus.svg`} alt="" className={styles.lotus} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${assetBase}/assets/gold-flourish.svg`} alt="" className={styles.flourish} />
        </div>

        <p className={styles.taglineTe}>{tagline}</p>
        <p className={styles.eyebrow}>{(event?.eventType || "Live Event").toUpperCase()}</p>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.metaRow}>
          {dateInfo ? (
            <span className={styles.metaChip}>
              {dateInfo.day} {dateInfo.month} {dateInfo.full.split(", ").pop()}
            </span>
          ) : null}
          {timeLabel ? <span className={styles.metaChip}>{timeLabel}</span> : null}
          {event?.location || event?.eventPlace ? (
            <span className={styles.metaChip}>{event.location || event.eventPlace}</span>
          ) : null}
        </div>

        {!isLive && countdown && !countdown.ended && sections.showCountdown !== false ? (
          <div className={styles.countdown}>
            <div className={styles.countdownLabel}>ప్రసారం ప్రారంభానికి</div>
            <div className={styles.countdownGrid}>
              {[
                ["days", countdown.days],
                ["hours", countdown.hours],
                ["mins", countdown.minutes],
                ["secs", countdown.seconds],
              ].map(([label, value]) => (
                <div key={label} className={styles.countdownUnit}>
                  <span className={styles.countdownNum}>{pad(value)}</span>
                  <span className={styles.countdownKey}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.playerFrame}>
          <div className={styles.playerFrameInner}>
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
                    {embed ? "▶ ప్రత్యక్ష ప్రసారం చూడండి" : "ప్రసారం త్వరలో ప్రారంభమవుతుంది"}
                  </span>
                </button>
              )
            ) : cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className={styles.coverOnly} />
            ) : null}
          </div>
        </div>

        <div className={styles.actions}>
          {showLive && embed && event?.showWatchLive !== false ? (
            <button type="button" className={styles.primaryBtn} onClick={() => setWatching(true)}>
              {watching ? "ప్రసారం చూస్తున్నారు" : "ప్రత్యక్ష ప్రసారం"}
            </button>
          ) : null}
          {event?.showSocialShare !== false && shareUrl ? (
            <button type="button" className={styles.secondaryBtn} onClick={shareInvite}>
              షేర్ చేయండి
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

        {!timeLabel && !dateInfo ? (
          <p className={styles.timingFallback}>
            {formatEventDateTime(event?.eventDate, event?.startTime)}
            {event?.location ? ` · ${event.location}` : ""}
          </p>
        ) : null}

        {sections.showGallery !== false && gallery.length > 0 ? (
          <section className={styles.gallery}>
            <h2>క్షణాలు</h2>
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
        SV Live · Traditional Streaming Theme
        {event?.location ? ` · ${event.location}` : ""}
      </footer>
    </div>
  );
}
