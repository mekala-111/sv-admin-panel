"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { formatEventDate, youtubeEmbedUrl } from "../lib/event-helpers";
import { getShowcasePreset } from "../lib/showcase-presets";
import { buildEventShareText, resolveEventShareImageUrl, shareEventWithImage } from "../lib/share-event";
import { resolveThemeSections, sectionOverridesFrom, shouldShowLivePlayer } from "../lib/theme-sections";
import styles from "./ShowcaseTheme.module.css";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,800&display=swap";

function Icon({ name }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "date")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    );
  if (name === "venue")
    return (
      <svg {...common}>
        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 3l2.6 5.6L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.7z" />
    </svg>
  );
}

/** Real uploads only — coverSrc() would swap in a stock photo for empty values. */
function imageOrEmpty(value) {
  return typeof value === "string" && value.trim() ? value : "";
}

/**
 * Portrait live-stream card: photo frame, eyebrow (page title), LIVE STREAM headline, LIVE pill,
 * framed player, message and a Date · Venue · tagline row. Style = config.showcase preset.
 */
export default function ShowcaseTheme({ event, youtube, media = [], branding, theme, publicPath }) {
  const config = theme?.config && typeof theme.config === "object" ? theme.config : {};
  const preset = getShowcasePreset(config.showcase);
  const colors = { ...preset.colors, ...(config.colors || {}) };
  const decor = new Set(preset.decor);
  const sections = useMemo(
    () => resolveThemeSections(theme, sectionOverridesFrom(event, branding)),
    [theme, event, branding]
  );

  const liveEmbed = youtubeEmbedUrl(youtube);
  const teaserEmbed = event?.teaserUrl ? youtubeEmbedUrl({ liveUrl: event.teaserUrl }) : null;
  const showLive = shouldShowLivePlayer(sections, youtube, liveEmbed, event);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  const embed = isLive ? liveEmbed : liveEmbed || teaserEmbed;
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);

  const photo = imageOrEmpty(event?.coverImage) || imageOrEmpty(event?.customImage);
  const poster = imageOrEmpty(event?.customImage) || imageOrEmpty(event?.coverImage);
  const eyebrow = event?.pageTitle || event?.eventName || preset.eyebrow;
  const headline = config.headline || preset.headline;
  const message = event?.remarks1 || config.message || preset.message;
  const tagline = config.tagline || preset.tagline;
  const dateText = formatEventDate(event?.eventDate)?.full || "Date";
  const venueText = event?.location || event?.eventPlace || "Venue";
  const timing = event?.liveTiming || "";
  // Short clock time for the broadcast lower third, e.g. "6:00 PM".
  const clock = (timing.match(/\d{1,2}:\d{2}\s*[AP]M/i) || [])[0] || "";
  const fontTitle = event?.fontFamily || config.fontFamily || preset.titleFont;

  const logo = branding?.logo || event?.logoImage;
  const company = branding?.companyName;
  const waNumber = String(branding?.whatsappNumber || "").replace(/\D/g, "");
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);
  const viewCount = Number(event?.viewCount);

  const shareUrl = typeof window !== "undefined" ? window.location.href : publicPath || "";
  const shareImageUrl = useMemo(() => resolveEventShareImageUrl(event), [event]);
  const onShare = useCallback(async () => {
    const title = event?.pageTitle || event?.eventName || "Live Event";
    await shareEventWithImage({
      url: shareUrl,
      text: buildEventShareText({
        url: shareUrl,
        title,
        tagline: event?.scrollMessage || `Watch live: ${title}`,
        placeLine: event?.location || event?.eventPlace || null,
      }),
      imageUrl: shareImageUrl || photo || undefined,
      title,
      fileName: "event-share.png",
    });
  }, [shareUrl, event, shareImageUrl, photo]);

  const isBroadcast = decor.has("broadcast");

  return (
    <div
      className={`${styles.root} ${styles[`style_${preset.key}`] || ""}`}
      style={{
        background: preset.page,
        "--sc-primary": event?.fontColor || colors.primary,
        "--sc-secondary": colors.secondary,
        "--sc-accent": colors.accent,
        "--sc-bg": colors.background,
        "--sc-text": colors.text,
        "--sc-title-font": fontTitle,
        "--sc-body-font": preset.bodyFont,
        "--sc-player-glow": preset.playerGlow || "none",
        "--sc-photo-filter": preset.photoFilter || "none",
        "--sc-message-style": preset.bodyFont.includes("Montserrat") ? "normal" : "italic",
      }}
    >
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      {decor.has("bokeh") ? <div className={styles.bokeh} aria-hidden /> : null}
      {decor.has("neon-lines") ? <div className={styles.neonLines} aria-hidden /> : null}
      {decor.has("gold-swirl") ? <div className={styles.goldSwirl} aria-hidden /> : null}

      <div className={`${styles.card} ${decor.has("glass") ? styles.glass : ""}`}>
        {decor.has("gold-border") ? <div className={styles.goldBorder} aria-hidden /> : null}
        {decor.has("floral-corners") ? <div className={styles.floralCorners} aria-hidden /> : null}
        {decor.has("lanterns") ? (
          <>
            <span className={`${styles.hanging} ${styles.lantern} ${styles.left}`} aria-hidden />
            <span className={`${styles.hanging} ${styles.lantern} ${styles.right}`} aria-hidden />
          </>
        ) : null}
        {decor.has("bells") ? (
          <>
            <span className={`${styles.hanging} ${styles.bell} ${styles.left}`} aria-hidden />
            <span className={`${styles.hanging} ${styles.bell} ${styles.right}`} aria-hidden />
          </>
        ) : null}

        {isBroadcast ? (
          <div className={styles.broadcastBar}>
            <span className={styles.liveBadge}>
              <span className={styles.dot} /> LIVE
            </span>
            <span className={styles.broadcastTitle}>Event {headline}</span>
            <span className={styles.hdBadge}>HD</span>
          </div>
        ) : null}

        {preset.frame !== "none" && !isBroadcast ? (
          <div className={styles.photoRow}>
            {decor.has("om") ? <span className={styles.om} aria-hidden>ॐ</span> : null}
            <div className={`${styles.photo} ${styles[`frame_${preset.frame}`]}`}>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" />
              ) : (
                <div className={styles.photoPlaceholder} aria-hidden />
              )}
            </div>
            {decor.has("om") ? <span className={styles.om} aria-hidden>ॐ</span> : null}
          </div>
        ) : null}

        {!isBroadcast ? (
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={`${styles.headline} ${styles[`title_${preset.titleStyle || "caps"}`]}`}>{headline}</h1>
            <div className={styles.rule} aria-hidden />
            {timing ? <p className={styles.timing}>{timing}</p> : null}
          </div>
        ) : null}

        <div className={styles.pillRow}>
          <span className={`${styles.pill} ${isLive ? styles.pillLive : ""}`}>
            <span className={styles.dot} /> {isLive ? "LIVE NOW" : "STARTING SOON"}
          </span>
        </div>

        {showLive ? (
          <div ref={playerRef} className={styles.player}>
            {playing && embed ? (
              <iframe
                src={embed.replace("autoplay=0", "autoplay=1")}
                title={eyebrow}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className={styles.poster}
                onClick={() => setPlaying(true)}
                disabled={!embed}
                style={poster ? { backgroundImage: `url(${poster})` } : undefined}
              >
                <span className={styles.playBtn} aria-hidden />
                <span className={styles.posterLabel}>
                  {embed ? (isLive || liveEmbed ? "Watch Live" : "Watch Teaser") : "Stream starting soon"}
                </span>
              </button>
            )}
          </div>
        ) : null}

        {isBroadcast ? (
          <div className={styles.lowerThird}>
            <span className={styles.ltLive}>LIVE</span>
            <span className={styles.ltTitle}>{eyebrow}</span>
            <span className={styles.ltTime}>{clock || dateText}</span>
          </div>
        ) : null}

        <p className={styles.message}>{message}</p>
        {event?.remarks2 ? <p className={styles.messageSub}>{event.remarks2}</p> : null}

        <div className={styles.infoRow}>
          <span>
            <Icon name="date" /> {dateText}
          </span>
          <span>
            <Icon name="venue" /> {venueText}
          </span>
          <span>
            <Icon name="tag" /> {tagline}
          </span>
        </div>

        {decor.has("equalizer") ? (
          <div className={styles.equalizer} aria-hidden>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${(i % 6) * 0.12}s` }} />
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.extras}>
        {logo || company || waNumber ? (
          <section className={styles.companyCard}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className={styles.companyLogo} />
            ) : null}
            <div className={styles.companyText}>
              {company ? <div className={styles.companyName}>{company}</div> : null}
              <div className={styles.companyTag}>Live streaming partner</div>
            </div>
            {waNumber ? (
              <a
                className={styles.contactBtn}
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm watching ${eyebrow}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            ) : null}
          </section>
        ) : null}

        {event?.showSocialShare !== false && shareUrl ? (
          <button type="button" className={styles.shareBtn} onClick={onShare}>
            Share event
          </button>
        ) : null}

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

        {Number.isFinite(viewCount) && viewCount > 0 ? (
          <div className={styles.hits}>
            <strong>{viewCount.toLocaleString("en-IN")}</strong> page views
          </div>
        ) : null}

        <footer className={styles.footer}>{company ? `${company} · ` : ""}Powered by SV Live</footer>
      </div>
    </div>
  );
}
