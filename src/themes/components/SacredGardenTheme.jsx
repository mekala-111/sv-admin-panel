"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { coverSrc, resolveCountdownTarget, youtubeEmbedUrl } from "../lib/event-helpers";
import {
  buildEventShareText,
  resolveEventShareImageUrl,
  shareEventWithImage,
} from "../lib/share-event";
import { resolveThemeSections, shouldShowLivePlayer } from "../lib/theme-sections";
import styles from "./SacredGardenTheme.module.css";

const DEFAULT_ASSET = "/themes/the-sacred-garden";
const DEFAULT_TAGLINE = "The Sacred Garden";
const DEFAULT_BLESSING =
  "Two souls, one beautiful journey, surrounded by love, blessed by family, and beginning forever together.";

const PETALS = [
  { left: "6%", w: 13, h: 9, round: "60% 40% 55% 45%", color: "#E8B5A6", opacity: 0.6, duration: 19, delay: 0 },
  { left: "19%", w: 9, h: 7, round: "60% 40% 55% 45%", color: "#87966C", opacity: 0.5, duration: 26, delay: -4 },
  { left: "31%", w: 15, h: 10, round: "60% 40% 55% 45%", color: "#E8B5A6", opacity: 0.45, duration: 22, delay: -9 },
  { left: "44%", w: 8, h: 8, round: "50%", color: "#B88938", opacity: 0.4, duration: 30, delay: -14 },
  { left: "57%", w: 12, h: 8, round: "60% 40% 55% 45%", color: "#E8B5A6", opacity: 0.55, duration: 24, delay: -6 },
  { left: "69%", w: 10, h: 7, round: "60% 40% 55% 45%", color: "#87966C", opacity: 0.45, duration: 28, delay: -18 },
  { left: "81%", w: 14, h: 9, round: "60% 40% 55% 45%", color: "#E8B5A6", opacity: 0.5, duration: 21, delay: -11 },
  { left: "92%", w: 9, h: 6, round: "60% 40% 55% 45%", color: "#B88938", opacity: 0.4, duration: 33, delay: -2 },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function splitCoupleName(event) {
  if (event?.brideName || event?.groomName) {
    return { left: event.brideName || "Bride", right: event.groomName || "Groom" };
  }
  const raw = event?.pageTitle || event?.eventName || "Bride & Groom";
  const parts = raw
    .split(/\s*(?:&|and|♡|weds)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return { left: parts[0], right: parts[1] };
  return { left: raw, right: "" };
}

function formatTimeLabel(event) {
  if (event?.eventTime) return event.eventTime;
  if (event?.liveTiming) return event.liveTiming;
  const t = event?.startTime ? new Date(event.startTime) : null;
  if (!t || Number.isNaN(t.getTime())) return null;
  return t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
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

function DiamondRule() {
  return (
    <div className={styles.diamondRule}>
      <div className={styles.ruleLine} />
      <div className={styles.diamond} />
      <div className={styles.ruleLineRev} />
    </div>
  );
}

export default function SacredGardenTheme({
  event,
  youtube,
  media = [],
  branding,
  theme,
  publicPath,
}) {
  const assetBase = theme?.config?.assetPath || DEFAULT_ASSET;
  const ASSET = `${assetBase.replace(/\/$/, "")}/assets`;
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [gone, setGone] = useState(false);
  const [watching, setWatching] = useState(true);

  const embed = useMemo(() => youtubeEmbedUrl(youtube), [youtube]);
  const sectionOverrides = useMemo(
    () => ({
      showSubEvents: branding?.customConfig?.showSubEvents ?? event?.showSubEvents,
      showInvitationCard:
        branding?.customConfig?.showInvitationCard ?? event?.showInvitationCard,
    }),
    [
      branding?.customConfig?.showSubEvents,
      branding?.customConfig?.showInvitationCard,
      event?.showSubEvents,
      event?.showInvitationCard,
    ]
  );
  const sections = useMemo(
    () => resolveThemeSections(theme, sectionOverrides),
    [theme, sectionOverrides]
  );
  const showLive = shouldShowLivePlayer(sections, youtube, embed, event);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  const { left, right } = splitCoupleName(event);
  const gardenTitle = theme?.config?.defaults?.tagline || theme?.name || DEFAULT_TAGLINE;
  const blessing = event?.description || theme?.config?.defaults?.description || DEFAULT_BLESSING;
  const cover = event?.coverImage ? coverSrc(event.coverImage) : null;
  const place = event?.eventPlace || event?.location || "";
  const eventTime = formatTimeLabel(event);
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);
  const galleryUrls = gallery.map((m) => m.thumbnailUrl || m.fileUrl).filter(Boolean);
  const subEvents = Array.isArray(event?.subEvents) ? event.subEvents.filter((s) => s?.title) : [];
  const dateValue = event?.eventDate || event?.startTime;
  const dateObj = dateValue ? new Date(dateValue) : null;
  const validDate = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj : null;
  const dayNum = validDate ? pad(validDate.getDate()) : null;
  const monthName = validDate
    ? validDate.toLocaleString("en-US", { month: "long" }).toUpperCase()
    : null;
  const year = validDate ? String(validDate.getFullYear()) : null;
  const weekday = validDate
    ? validDate.toLocaleString("en-US", { weekday: "long" }).toUpperCase()
    : null;
  const dateDots = validDate
    ? `${pad(validDate.getDate())} · ${pad(validDate.getMonth() + 1)} · ${validDate.getFullYear()}`
    : null;
  const countdownTarget = resolveCountdownTarget(event);
  const countdown = useCountdown(sections.showCountdown !== false ? countdownTarget : null);
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.href;
    return publicPath || "";
  }, [publicPath]);
  const shareImageUrl = useMemo(() => resolveEventShareImageUrl(event), [event]);
  const shareText = useMemo(
    () =>
      buildEventShareText({
        url: shareUrl,
        title: `${left}${right ? ` & ${right}` : ""}`,
        tagline: event?.scrollMessage || gardenTitle,
        placeLine: place || null,
      }),
    [shareUrl, left, right, event?.scrollMessage, gardenTitle, place]
  );
  const shareInvite = useCallback(
    async (e) => {
      e?.preventDefault?.();
      await shareEventWithImage({
        url: shareUrl,
        text: shareText,
        imageUrl: shareImageUrl || cover,
        title: gardenTitle,
        fileName: "sacred-garden-invite.png",
      });
    },
    [shareUrl, shareText, shareImageUrl, cover, gardenTitle]
  );

  function openEnvelope() {
    if (opened || closing) return;
    setOpened(true);
    window.setTimeout(() => setClosing(true), 1600);
    window.setTimeout(() => setGone(true), 3000);
  }

  const mapsQuery = encodeURIComponent(place || "");
  const mapsHref = place ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null;

  return (
    <div className={styles.root}>
      <link rel="stylesheet" href={`${assetBase.replace(/\/$/, "")}/style.css`} />

      {!gone ? (
        <div
          className={`${styles.envelope} ${closing ? styles.envelopeClosing : ""} ${
            opened ? styles.envelopeOpened : ""
          }`}
        >
          <div className={`${styles.corner} ${styles.cornerTL}`} />
          <div className={`${styles.corner} ${styles.cornerTR}`} />
          <div className={`${styles.corner} ${styles.cornerBL}`} />
          <div className={`${styles.corner} ${styles.cornerBR}`} />
          <div className={styles.envelopeGlow} aria-hidden />
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <div className={styles.envelopeLabel}>WEDDING INVITATION</div>
            <div className={styles.envelopeTitle}>{gardenTitle}</div>
          </div>
          <button type="button" className={styles.envelopeBtn} onClick={openEnvelope} aria-label="Open invitation">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/envelope-closed.png`} alt="" className={styles.envelopeImg} draggable={false} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/envelope-open.png`} alt="" className={styles.envelopeOpenImg} draggable={false} />
          </button>
          {!opened ? <div className={styles.tapHint}>TAP TO OPEN</div> : null}
        </div>
      ) : null}

      <div className={styles.petals} aria-hidden>
        {PETALS.map((p, i) => (
          <div
            key={i}
            className={styles.petal}
            style={{
              left: p.left,
              width: p.w,
              height: p.h,
              borderRadius: p.round,
              background: p.color,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <main className={styles.shell}>
        <section className={styles.hero} id="home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/frame-background.png`} alt="" className={styles.heroBg} />
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <div className={styles.scriptTitle}>{gardenTitle}</div>
            <DiamondRule />
            <div className={styles.eyebrow}>Together with their families</div>
            <h1 className={styles.coupleName}>{left}</h1>
            {right ? (
              <>
                <div className={styles.amp}>&amp;</div>
                <h1 className={styles.coupleName} style={{ margin: "0 0 28px" }}>
                  {right}
                </h1>
              </>
            ) : null}
            <div className={styles.inviteLine}>Invite you to celebrate their wedding</div>

            {dayNum ? (
              <div className={styles.dateBlock}>
                <div className={styles.dateRail} />
                <div>
                  <div className={styles.dateDay}>{dayNum}</div>
                  <div className={styles.dateMonth}>{monthName}</div>
                  <div className={styles.dateYear}>{year}</div>
                </div>
                <div className={styles.dateRail} />
              </div>
            ) : null}
            {(weekday || eventTime) && (
              <div className={styles.timeLine}>
                {[weekday, eventTime].filter(Boolean).join("  ·  ")}
              </div>
            )}

            {place ? (
              <div className={styles.venueCard}>
                <div className={styles.venueName}>{place.toUpperCase()}</div>
              </div>
            ) : null}

            {showLive && isLive ? (
              <div className={styles.liveBadge} style={{ marginTop: 22 }}>
                <span className={styles.liveDot} /> LIVE NOW
              </div>
            ) : null}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.eyebrow}>A CELEBRATION OF</div>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleMaroon}`} style={{ fontSize: 52 }}>
            Love
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/divider-gold.png`} alt="" className={styles.divider} />
          <p className={styles.quote}>&ldquo;{blessing}&rdquo;</p>
        </section>

        {countdown && !countdown.ended && sections.showCountdown !== false ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ fontSize: 44 }}>
              The Celebration Begins In
            </h2>
            <div className={styles.countdownGrid}>
              {[
                ["Days", countdown.days],
                ["Hours", countdown.hours],
                ["Minutes", countdown.minutes],
                ["Seconds", countdown.seconds],
              ].map(([label, value], index, arr) => (
                <div key={label} style={{ display: "contents" }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.countdownNum}>{pad(value)}</div>
                    <div className={styles.countdownLabel}>{label}</div>
                  </div>
                  {index < arr.length - 1 ? <div className={styles.countdownColon}>:</div> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showLive ? (
          <section className={`${styles.section} ${styles.sectionAlt}`} id="live">
            <div className={styles.sectionLabel}>WATCH WITH US</div>
            <h2 className={styles.sectionTitle}>Live Streaming</h2>
            {countdown && !countdown.ended && sections.showCountdown !== false ? (
              <div className={styles.countdownGrid} style={{ marginBottom: 18 }}>
                {[
                  ["Days", countdown.days],
                  ["Hours", countdown.hours],
                  ["Minutes", countdown.minutes],
                  ["Seconds", countdown.seconds],
                ].map(([label, value], index, arr) => (
                  <div key={label} style={{ display: "contents" }}>
                    <div style={{ flex: 1 }}>
                      <div className={styles.countdownNum}>{pad(value)}</div>
                      <div className={styles.countdownLabel}>{label}</div>
                    </div>
                    {index < arr.length - 1 ? <div className={styles.countdownColon}>:</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className={styles.playerShell}>
              {watching && embed ? (
                <iframe
                  src={embed}
                  title={`${left} & ${right}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.player}
                />
              ) : (
                <button
                  type="button"
                  className={styles.poster}
                  onClick={() => embed && setWatching(true)}
                  style={{ backgroundImage: `url(${cover || `${ASSET}/couple-portrait.webp`})` }}
                  disabled={!embed}
                >
                  <span className={styles.posterShade} />
                  <span className={styles.watchBtn}>
                    {embed ? "WATCH LIVE" : "STREAM STARTING SOON"}
                  </span>
                </button>
              )}
            </div>
            {event?.showWatchLive !== false || event?.showSocialShare !== false ? (
              <div className={styles.pillRow}>
                {embed && event?.showWatchLive !== false ? (
                  <button type="button" className={styles.pill} onClick={() => setWatching(true)}>
                    {watching ? "WATCHING LIVE" : "WATCH LIVE"}
                  </button>
                ) : null}
                {event?.showSocialShare !== false && shareUrl ? (
                  <button type="button" className={styles.pill} onClick={shareInvite}>
                    SHARE INVITE
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {sections.showSubEvents !== false && subEvents.length > 0 ? (
          <section className={`${styles.section} ${styles.sectionAlt}`} id="events">
            <div className={styles.sectionLabel}>THE FESTIVITIES</div>
            <h2 className={styles.sectionTitle}>Our Events</h2>
            <div className={styles.eventList}>
              {subEvents.map((row, index) => {
                const featured = index === Math.floor(subEvents.length / 2) || subEvents.length === 1;
                return (
                  <div
                    key={`${row.title}-${index}`}
                    className={`${styles.eventCard} ${featured ? styles.eventCardFeatured : ""}`}
                  >
                    {featured ? <div className={styles.eventInner} /> : null}
                    {!featured ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${ASSET}/corner-spray.png`} alt="" className={styles.cornerSpray} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${ASSET}/corner-spray.png`}
                          alt=""
                          className={`${styles.cornerSpray} ${styles.cornerSprayRight}`}
                        />
                      </>
                    ) : null}
                    <div className={styles.eventDotRing} style={{ position: "relative" }}>
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverSrc(row.image)}
                          alt=""
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #c9a227",
                          }}
                        />
                      ) : (
                        <div className={styles.eventDot} />
                      )}
                    </div>
                    <div
                      className={`${styles.eventName} ${featured ? styles.eventNameFeatured : ""}`}
                      style={{ position: "relative" }}
                    >
                      {String(row.title).toUpperCase()}
                    </div>
                    <div className={styles.goldRule} style={{ position: "relative" }} />
                    <div className={styles.eventMeta} style={{ position: "relative" }}>
                      {[row.date, row.place].filter(Boolean).join("  ·  ") || "Details soon"}
                    </div>
                    {row.time ? (
                      <div
                        className={`${styles.eventTime} ${featured ? styles.eventTimeFeatured : ""}`}
                        style={{ position: "relative" }}
                      >
                        {row.time}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {place ? (
          <section className={styles.section} id="venue">
            <div className={styles.sectionLabel}>WHERE WE GATHER</div>
            <h2 className={styles.sectionTitle}>The Venue</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/gazebo-scene.png`} alt="" className={styles.venueImg} style={{ marginTop: 26 }} />
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <div className={styles.venueName}>{place.toUpperCase()}</div>
            </div>
            {mapsHref ? (
              <div className={styles.pillRow}>
                <a className={styles.pill} href={mapsHref} target="_blank" rel="noreferrer">
                  VIEW LOCATION
                </a>
                <a className={styles.pill} href={mapsHref} target="_blank" rel="noreferrer">
                  GET DIRECTIONS
                </a>
              </div>
            ) : null}
          </section>
        ) : null}

        {sections.showGallery !== false && galleryUrls.length > 0 ? (
          <section className={styles.section} id="gallery">
            <div className={styles.sectionLabel}>FROM THE ALBUM</div>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleMaroon}`} style={{ fontSize: 44 }}>
              A Few Moments
            </h2>
            <div className={styles.galleryGrid}>
              {galleryUrls.map((src, index) => (
                <div key={`${src}-${index}`} className={styles.galleryItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {(event?.remarks1 || event?.remarks2) && (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.sectionLabel}>WITH LOVE</div>
            <h2 className={styles.sectionTitle}>Hosts & Family</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/divider-gold.png`} alt="" className={styles.divider} />
            {event.remarks1 ? <p className={styles.quote}>{event.remarks1}</p> : null}
            {event.remarks2 ? (
              <p className={styles.quote} style={{ marginTop: 18, whiteSpace: "pre-line" }}>
                {event.remarks2}
              </p>
            ) : null}
          </section>
        )}

        <section className={styles.thankYou}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/arch-garden.png`} alt="" className={styles.arch} />
          <div style={{ position: "relative" }}>
            <h2 className={styles.thankTitle}>Thank You!</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/divider-gold-2.png`} alt="" className={styles.divider} style={{ width: 180 }} />
            <p className={styles.quote} style={{ fontSize: 19 }}>
              We can&apos;t wait to celebrate with you.
            </p>
            <div className={styles.thankNames}>
              {left.toUpperCase()}
              {right ? ` & ${right.toUpperCase()}` : ""}
            </div>
            {dateDots ? <div className={styles.thankDate}>{dateDots}</div> : null}
            {branding?.companyName ? (
              <div style={{ marginTop: 28, fontSize: 12, letterSpacing: "0.16em", color: "rgba(108,81,63,0.55)" }}>
                Hosted by {branding.companyName}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>SV Live · The Sacred Garden</footer>
    </div>
  );
}
