"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { coverSrc, formatEventDateTime, youtubeEmbedUrl } from "../lib/event-helpers";
import { getBannerPreset } from "../lib/banner-presets";
import { buildEventShareText, resolveEventShareImageUrl, shareEventWithImage } from "../lib/share-event";
import { resolveThemeSections, sectionOverridesFrom, shouldShowLivePlayer } from "../lib/theme-sections";
import styles from "./EventBannerTheme.module.css";

/** Dark text on light colours, white on dark (hex only; anything else counts as dark). */
function readableOn(hex) {
  const m = String(hex || "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return "#FFFFFF";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#1B1B1B" : "#FFFFFF";
}

/**
 * eLive-style banner page: event artwork across the top with the title, live timing and a
 * Watch Live button, then the player, host/company card, notes, gallery and page hits.
 * Artwork = admin-uploaded config.backgroundImage, else the CSS preset in config.banner.
 */
export default function EventBannerTheme({ event, youtube, media = [], branding, theme, publicPath }) {
  const config = theme?.config && typeof theme.config === "object" ? theme.config : {};
  const preset = getBannerPreset(config.banner);
  const colors = { ...preset.colors, ...(config.colors || {}) };
  const sections = useMemo(
    () => resolveThemeSections(theme, sectionOverridesFrom(event, branding)),
    [theme, event, branding]
  );

  const liveEmbed = youtubeEmbedUrl(youtube);
  const teaserEmbed = event?.teaserUrl ? youtubeEmbedUrl({ liveUrl: event.teaserUrl }) : null;
  const showLive = shouldShowLivePlayer(sections, youtube, liveEmbed, event);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  // Before the stream starts, play the teaser if there is one.
  const embed = isLive ? liveEmbed : liveEmbed || teaserEmbed;
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);

  const title = event?.pageTitle || event?.eventName || "Live Event";
  const timing =
    event?.liveTiming ||
    [formatEventDateTime(event?.eventDate, event?.startTime), event?.location].filter(Boolean).join(" · ");
  const fontFamily = event?.fontFamily || config.fontFamily || preset.fontFamily;
  const accent = event?.fontColor || colors.primary;
  // coverSrc() substitutes a stock photo for empty values — only use real uploads here.
  const uploadedArt = typeof config.backgroundImage === "string" && config.backgroundImage ? config.backgroundImage : "";
  const posterImage = event?.customImage || event?.coverImage || "";
  const heroStyle = uploadedArt
    ? { backgroundImage: `url(${uploadedArt})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: preset.hero };
  const heroText = uploadedArt ? "#FFFFFF" : preset.heroText;

  const logo = branding?.logo || event?.logoImage;
  const company = branding?.companyName;
  const waNumber = String(branding?.whatsappNumber || "").replace(/\D/g, "");
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);
  const viewCount = Number(event?.viewCount);

  const shareUrl = typeof window !== "undefined" ? window.location.href : publicPath || "";
  const shareImageUrl = useMemo(() => resolveEventShareImageUrl(event), [event]);
  const onShare = useCallback(async () => {
    await shareEventWithImage({
      url: shareUrl,
      text: buildEventShareText({
        url: shareUrl,
        title,
        tagline: event?.scrollMessage || `Watch live: ${title}`,
        placeLine: event?.location || event?.eventPlace || null,
      }),
      imageUrl: shareImageUrl || (event?.coverImage ? coverSrc(event.coverImage) : undefined),
      title,
      fileName: "event-share.png",
    });
  }, [shareUrl, title, event, shareImageUrl]);

  function watchLive() {
    setPlaying(true);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div
      className={styles.root}
      style={{
        "--eb-accent": accent,
        "--eb-secondary": colors.secondary,
        "--eb-on-secondary": readableOn(colors.secondary),
        "--eb-bg": colors.background,
        "--eb-text": colors.text,
        "--eb-hero-text": heroText,
        "--eb-font": fontFamily,
      }}
    >
      {event?.scrollMessage ? (
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            <span>{event.scrollMessage}</span>
            <span aria-hidden>{event.scrollMessage}</span>
          </div>
        </div>
      ) : null}

      <header className={styles.hero} style={heroStyle}>
        {uploadedArt ? <div className={styles.heroShade} aria-hidden /> : null}
        {!uploadedArt && preset.decoration ? (
          <div className={`${styles.decor} ${styles[`decor_${preset.decoration}`] || ""}`} aria-hidden />
        ) : null}
        <div className={styles.heroInner}>
          <div className={styles.statusPill} data-live={isLive ? "1" : "0"}>
            {isLive ? (
              <>
                <span className={styles.liveDot} /> LIVE
              </>
            ) : (
              "UPCOMING"
            )}
          </div>
          <h1 className={styles.title}>{title}</h1>
          {timing ? <p className={styles.timing}>{timing}</p> : null}
          {showLive && event?.showWatchLive !== false ? (
            <button type="button" className={styles.watchBtn} onClick={watchLive}>
              <span className={styles.playIcon} aria-hidden /> Watch Live
            </button>
          ) : null}
        </div>
      </header>

      <main className={styles.body}>
        {showLive ? (
          <section ref={playerRef} className={styles.playerCard}>
            {playing && embed ? (
              <iframe
                src={embed.replace("autoplay=0", "autoplay=1")}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.player}
              />
            ) : (
              <button
                type="button"
                className={styles.poster}
                onClick={() => setPlaying(true)}
                style={posterImage ? { backgroundImage: `url(${posterImage})` } : heroStyle}
                disabled={!embed}
              >
                <span className={styles.posterShade} />
                <span className={styles.posterLabel}>
                  {embed ? (isLive || liveEmbed ? "▶ Watch Live" : "▶ Watch Teaser") : "Stream starting soon"}
                </span>
              </button>
            )}
          </section>
        ) : null}

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
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm watching ${title}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            ) : null}
          </section>
        ) : null}

        {event?.description || event?.remarks1 || event?.remarks2 ? (
          <section className={styles.notes}>
            {event.description ? <p>{event.description}</p> : null}
            {event.remarks1 ? <p>{event.remarks1}</p> : null}
            {event.remarks2 ? <p>{event.remarks2}</p> : null}
          </section>
        ) : null}

        {event?.showSocialShare !== false && shareUrl ? (
          <div className={styles.actions}>
            <button type="button" className={styles.shareBtn} onClick={onShare}>
              Share event
            </button>
          </div>
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
            <span className={styles.hitsCount}>{viewCount.toLocaleString("en-IN")}</span>
            <span>page views</span>
          </div>
        ) : null}
      </main>

      <footer className={styles.footer}>
        {company ? `${company} · ` : ""}Powered by SV Live
      </footer>
    </div>
  );
}
