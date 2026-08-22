"use client";

import { useMemo, useState } from "react";
import {
  coverSrc,
  formatEventDateTime,
  youtubeEmbedUrl,
} from "../lib/event-helpers";
import styles from "./CinematicLiveTheme.module.css";

export default function CinematicLiveTheme({
  event,
  youtube,
  media = [],
  branding,
  publicPath,
}) {
  const [watching, setWatching] = useState(true);
  const embed = useMemo(() => youtubeEmbedUrl(youtube), [youtube]);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  const title = event?.pageTitle || event?.eventName || "Live Event";
  const fontFamily = event?.fontFamily || "Cormorant Garamond, Georgia, serif";
  const accent = event?.fontColor || branding?.primaryColor || "#E8C36A";
  const cover = coverSrc(event?.coverImage);
  const logo = branding?.logo || event?.logoImage;
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : publicPath || "";
  const waNumber = (branding?.whatsappNumber || "").replace(/\D/g, "");
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);

  return (
    <div
      className={styles.root}
      style={{
        "--cine-accent": accent,
        "--cine-font": fontFamily,
      }}
    >
      <div className={styles.bgGlow} aria-hidden />
      <div
        className={styles.bgCover}
        style={{ backgroundImage: `url(${cover})` }}
        aria-hidden
      />

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
          {branding?.companyName ? (
            <span className={styles.host}>{branding.companyName}</span>
          ) : null}
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
          {watching && embed ? (
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
              {event?.showWatchLive !== false ? (
                <span className={styles.watchBtn}>
                  {embed ? "Watch Live" : "Stream starting soon"}
                </span>
              ) : (
                <span className={styles.watchBtn}>Preview</span>
              )}
            </button>
          )}
        </div>

        <div className={styles.actions}>
          {embed && event?.showWatchLive !== false ? (
            <button type="button" className={styles.primaryBtn} onClick={() => setWatching(true)}>
              {watching ? "Playing" : "Watch Live"}
            </button>
          ) : null}
          {event?.showSocialShare !== false && shareUrl ? (
            <a
              className={styles.secondaryBtn}
              href={`https://wa.me/${waNumber || ""}?text=${encodeURIComponent(
                `Watch live: ${title} — ${shareUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Share on WhatsApp
            </a>
          ) : null}
        </div>

        {(event?.remarks1 || event?.remarks2 || event?.description) && (
          <div className={styles.notes}>
            {event.description ? <p>{event.description}</p> : null}
            {event.remarks1 ? <p>{event.remarks1}</p> : null}
            {event.remarks2 ? <p>{event.remarks2}</p> : null}
          </div>
        )}

        {gallery.length > 0 ? (
          <section className={styles.gallery}>
            <h2>Moments</h2>
            <div className={styles.galleryGrid}>
              {gallery.map((item) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id || item.fileUrl}
                  src={item.thumbnailUrl || item.fileUrl}
                  alt=""
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className={styles.footer}>
        Powered by SV Live
        {event?.location ? ` · ${event.location}` : ""}
      </footer>
    </div>
  );
}
