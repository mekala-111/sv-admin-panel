"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { coverSrc, resolveCountdownTarget, youtubeEmbedUrl } from "../lib/event-helpers";
import {
  buildEventShareText,
  resolveEventShareImageUrl,
  shareEventWithImage,
} from "../lib/share-event";
import { resolveThemeSections, shouldShowLivePlayer } from "../lib/theme-sections";
import styles from "./WeddingThemeTraditional.module.css";

const DEFAULT_ASSET = "/themes/wedding-theme-traditional";
const PETAL_SPRITES = ["heart.svg", "heart.svg", "heart.svg", "heart.svg"];
const DEFAULT_INVITE = `${DEFAULT_ASSET}/assets/invitation.jpg`;
const DEFAULT_POSTER = `${DEFAULT_ASSET}/assets/poster.png`;
const DEFAULT_BLESSING =
  "With the divine blessings of Lord Shiva and Goddess Parvati, we invite you to celebrate the beginning of our beautiful journey together.";
const DEFAULT_TAGLINE = "వివాహ మహోత్సవానికి సాదర ఆహ్వానం";

function pad(n) {
  return String(n).padStart(2, "0");
}

function splitCoupleName(event) {
  if (event?.brideName || event?.groomName) {
    return {
      left: event.brideName || "Bride",
      right: event.groomName || "Groom",
    };
  }
  const raw = event?.pageTitle || event?.eventName || "Bride & Groom";
  const parts = raw.split(/\s*(?:&|and|♡|weds)\s*/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { left: parts[0], right: parts[1] };
  return { left: raw, right: "" };
}

function formatDateDots(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return `${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`;
}

function formatDateBullets(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return `${pad(d.getDate())} • ${pad(d.getMonth() + 1)} • ${d.getFullYear()}`;
}

function formatTimeLabel(event) {
  if (event?.eventTime) return event.eventTime;
  const t = event?.startTime ? new Date(event.startTime) : null;
  if (!t || Number.isNaN(t.getTime())) return null;
  return t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function venueShortName(place) {
  if (!place) return "";
  return String(place).split(",")[0]?.trim() || place;
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

function EventRow({ children }) {
  return (
    <div className="event-row">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 4v4M16 4v4M4 11h16" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function TimeRow({ children }) {
  return (
    <div className="event-row">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 8v4.4l2.8 1.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function PlaceRow({ children }) {
  return (
    <div className="event-row">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function Portrait({ src, alt, mono }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <div className="frame">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : null}
      {!showImage ? <div className="mono">{mono}</div> : null}
    </div>
  );
}

export default function WeddingThemeTraditional({
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
  const [introGone, setIntroGone] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [watching, setWatching] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicAvailable, setMusicAvailable] = useState(true);

  const embed = useMemo(() => youtubeEmbedUrl(youtube), [youtube]);
  const sections = useMemo(() => resolveThemeSections(theme), [theme]);
  const showLive = shouldShowLivePlayer(sections, youtube, embed, event);
  const isLive = event?.status === "LIVE" || youtube?.status === "LIVE";
  const { left, right } = splitCoupleName(event);
  const title = event?.pageTitle || event?.eventName || "Wedding Celebration";
  const tagline = event?.scrollMessage || DEFAULT_TAGLINE;
  const cover = event?.coverImage ? coverSrc(event.coverImage) : null;
  const bridePhoto = event?.brideImage ? coverSrc(event.brideImage) : cover;
  const groomPhoto = event?.groomImage ? coverSrc(event.groomImage) : null;
  const place = event?.eventPlace || event?.location || "";
  const venueName = venueShortName(place);
  const eventTime = formatTimeLabel(event);
  const dateDots = formatDateDots(event?.eventDate || event?.startTime);
  const dateBullets = formatDateBullets(event?.eventDate || event?.startTime);
  const gallery = media.filter((m) => m?.fileUrl || m?.thumbnailUrl);
  const galleryUrls = gallery.map((m) => m.thumbnailUrl || m.fileUrl).filter(Boolean);
  const subEvents = Array.isArray(event?.subEvents) ? event.subEvents.filter((s) => s?.title) : [];
  const invitationCard = event?.invitationCard ? coverSrc(event.invitationCard) : DEFAULT_INVITE;
  const countdown = useCountdown(resolveCountdownTarget(event));
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.href;
    return publicPath || "";
  }, [publicPath]);
  const phone = (branding?.phone || branding?.contactPhone || "").replace(/\s/g, "");

  const hostImage1 = event?.logoImage ? coverSrc(event.logoImage) : null;
  const hostImage2 = event?.customImage ? coverSrc(event.customImage) : null;
  const hostCopy = useMemo(() => {
    if (!event?.remarks1) return { names: null, place: null };
    const lines = String(event.remarks1)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return { names: null, place: null };
    if (lines.length === 1) return { names: lines[0], place: null };
    return { names: lines[0], place: lines.slice(1).join("\n") };
  }, [event?.remarks1]);
  const showHosts = Boolean(hostCopy.names || hostCopy.place || hostImage1 || hostImage2);
  const familyLines = useMemo(() => {
    if (!event?.remarks2) return [];
    return String(event.remarks2)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [event?.remarks2]);

  const storySteps = useMemo(() => {
    const defaults = [
      {
        title: "The Beginning",
        text: "Two hearts met, and a quiet promise took root — the start of a story written in laughter, patience, and love.",
        glyph: "♥",
      },
      {
        title: "A Beautiful Bond",
        text: "Through seasons of becoming, we chose each other again and again — family, faith, and a future we could see together.",
        glyph: "⚭",
      },
      {
        title: "Forever Begins",
        text: "Now we begin our journey as one, and we would be honoured to have your blessings on this sacred day.",
        glyph: "∞",
      },
    ];
    if (!event?.description) return defaults;
    return [{ ...defaults[0], text: event.description }, defaults[1], defaults[2]];
  }, [event?.description]);

  const mapsUrl = useMemo(() => {
    const q = place || venueName;
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "#";
  }, [place, venueName]);

  const calendarUrl = useMemo(() => {
    const startRaw = event?.startTime || event?.eventDate;
    if (!startRaw) return "#";
    const start = new Date(startRaw);
    if (Number.isNaN(start.getTime())) return "#";
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const fmt = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    const text = `${left}${right ? ` & ${right}` : ""} Wedding`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(place)}`;
  }, [event?.startTime, event?.eventDate, left, right, place]);

  const shareImageUrl = useMemo(
    () => resolveEventShareImageUrl(event, DEFAULT_POSTER),
    [event]
  );

  const shareText = useMemo(
    () =>
      buildEventShareText({
        url: shareUrl,
        title,
        coupleLine: right ? `${left} ❤️ ${right}` : left,
        tagline,
        dateLine: dateDots,
        timeLine: eventTime,
        placeLine: place,
      }),
    [shareUrl, title, left, right, tagline, dateDots, eventTime, place]
  );

  const shareInvite = useCallback(
    async (e) => {
      e?.preventDefault?.();
      await shareEventWithImage({
        url: shareUrl,
        text: shareText,
        imageUrl: shareImageUrl,
        title,
        fileName: "wedding-invite.png",
      });
    },
    [shareUrl, shareText, shareImageUrl, title]
  );

  const spawnPetals = useCallback(() => {
    const layer = document.getElementById("wtt-petals");
    if (!layer) return;
    layer.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const img = document.createElement("img");
      img.src = `${ASSET}/${PETAL_SPRITES[i % PETAL_SPRITES.length]}`;
      img.alt = "";
      img.className = "petal";
      img.style.left = `${(i * 9 + 3) % 96}%`;
      img.style.width = `${26 + (i % 3) * 10}px`;
      img.style.setProperty("--drift", `${(i % 2 === 0 ? 1 : -1) * (20 + (i * 7) % 40)}px`);
      img.style.animationDuration = `${14 + (i % 4) * 3}s`;
      img.style.animationDelay = `${i * 1.6}s`;
      layer.appendChild(img);
    }
  }, []);

  useEffect(() => {
    if (opened) spawnPetals();
  }, [opened, spawnPetals]);

  const openSite = useCallback(() => {
    setIntroGone(true);
    setOpened(true);
    window.setTimeout(() => {
      const intro = document.getElementById("wtt-intro");
      if (intro) intro.hidden = true;
    }, 700);
    window.setTimeout(() => spawnPetals(), 80);
    const audio = document.getElementById("wtt-bgm");
    if (audio) {
      audio.play()
        .then(() => setMusicPlaying(true))
        .catch(() => {});
    }
  }, [spawnPetals]);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setInviteOpen(false);
        setLightboxOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openInvite() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInviteOpen(true);
      return;
    }
    setEnvelopeOpening(true);
    window.setTimeout(() => setInviteOpen(true), 450);
    window.setTimeout(() => setEnvelopeOpening(false), 900);
  }

  function toggleMusic() {
    const audio = document.getElementById("wtt-bgm");
    if (!audio || !musicAvailable) return;
    if (audio.paused) {
      audio.play()
        .then(() => setMusicPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  }

  function renderSubEventCard(item, index) {
    const isSingle = subEvents.length === 1;
    const isFirst = !isSingle && index === 0;
    const isHighlight = isSingle || index === subEvents.length - 1;
    const cardClass = isFirst ? "pellikuthuru" : isHighlight ? "highlight" : "plain";
    const customImage = item.image ? coverSrc(item.image) : null;
    // Always render a frame so absolutely-positioned card body has height (3rd+ cards were invisible).
    const frameSrc = isFirst
      ? `${ASSET}/bride-event.png`
      : `${ASSET}/event-frame.png`;

    return (
      <article className={`event-card ${cardClass}`.trim()} key={`${item.title}-${index}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="event-frame" src={frameSrc} alt="" />
        <div className="event-card-body">
          {customImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="sub-event-photo" src={customImage} alt={item.title} />
          ) : isHighlight && !isFirst ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="wedding-icon" src={`${ASSET}/wedding-icon.png`} alt="" />
          ) : null}
          <h3>{item.title}</h3>
          {item.date ? <EventRow>{item.date}</EventRow> : null}
          {item.time ? <TimeRow>{item.time}</TimeRow> : null}
          {item.place ? <PlaceRow>{item.place}</PlaceRow> : null}
        </div>
      </article>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Peddana&family=Playfair+Display:wght@500;600;700&family=Ramabhadra&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap"
      />
      <link rel="stylesheet" href={`${assetBase.replace(/\/$/, "")}/style.css`} />

      <svg className="svg-filters" aria-hidden="true">
        <filter id="knockout-black" colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  5 5 5 0 -0.18" />
        </filter>
      </svg>

      <div className={styles.root}>
        <a className="skip" href="#hero">
          Skip to invitation
        </a>

        {!introGone ? (
          <div className={`intro ${introGone ? "is-gone" : ""}`} id="wtt-intro">
            <div className="intro-stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="intro-bg" src={`${ASSET}/LANDING-BG.png`} alt="" />
              <div className="intro-inner">
                <div className="intro-ganesha-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="intro-ganesha" src={`${ASSET}/ganesh.png`} alt="Lord Ganesha" />
                </div>
                <div className="intro-shubh">శుభమస్తు</div>
                <div className="intro-sub">|| శుభకార్యమస్తు ||</div>
                <h1 className="intro-title">{title}</h1>
                <div className="intro-flourish" aria-hidden="true">
                  <i />
                  <span />
                  <i />
                </div>
                <div className="intro-names">
                  <div className="script-name">{left}</div>
                  {right ? (
                    <>
                      <svg className="heart-outline" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20s-7.2-4.4-9.4-8.2C.8 8.8 2.2 5 6 5c2.1 0 3.4 1.2 4 2.2C10.6 6.2 11.9 5 14 5c3.8 0 5.2 3.8 3.4 6.8C19.2 15.6 12 20 12 20Z" />
                      </svg>
                      <div className="script-name">{right}</div>
                    </>
                  ) : null}
                </div>
                <div className="intro-invite">{tagline}</div>
                {dateDots ? (
                  <div className="intro-date">
                    <svg className="gold-flower" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 3.2c.6 2.4 1.4 4.2 3.8 5-2.4.8-3.2 2.6-3.8 5-.6-2.4-1.4-4.2-3.8-5 2.4-.8 3.2-2.6 3.8-5Z" />
                    </svg>
                    {dateDots}
                    <svg className="gold-flower" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 3.2c.6 2.4 1.4 4.2 3.8 5-2.4.8-3.2 2.6-3.8 5-.6-2.4-1.4-4.2-3.8-5 2.4-.8 3.2-2.6 3.8-5Z" />
                    </svg>
                  </div>
                ) : null}
                {(eventTime || place) && (
                  <div className="intro-meta">
                    {eventTime ? (
                      <span>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
                          <path d="M12 8v4.4l2.8 1.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                        {eventTime}
                      </span>
                    ) : null}
                    {eventTime && place ? <i /> : null}
                    {place ? (
                      <span>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
                          <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                        {venueName.toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                )}
                <button className="intro-cta" type="button" onClick={openSite}>
                  VIEW INVITATION →
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`page ${opened ? "is-open" : ""}`} id="page">
          <div className="petals" id="wtt-petals" aria-hidden="true" />

          <header className="hero" id="hero">
            <div className="garlands" aria-hidden="true">
              <span className="garland g-a" />
              <span className="garland g-b" />
              <span className="garland g-c" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero-deity" src={`${ASSET}/shiva-parvati.png`} alt="Lord Shiva and Goddess Parvati" />
            <div className="hero-blessing">॥ శుభమస్తు ॥</div>
            <div className="hero-blessing small">॥ సకల శుభమస్తు ॥</div>
            <div className="hero-names">
              <div className="script-name">{left}</div>
              {right ? (
                <>
                  <div className="heart">♡</div>
                  <div className="script-name">{right}</div>
                </>
              ) : null}
            </div>
            <div className="te-line">{tagline}</div>
            {sections.showCouplePhotos !== false ? (
              <div className="couple">
                <div className="portrait">
                  <Portrait src={bridePhoto} alt={left} mono={(left || "B").slice(0, 1)} />
                  <div className="flowers" aria-hidden="true">
                    🌸🌼🌸
                  </div>
                </div>
                {right ? (
                  <div className="portrait">
                    <Portrait src={groomPhoto} alt={right} mono={right.slice(0, 1)} />
                    <div className="flowers" aria-hidden="true">
                      🌸🌼🌸
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="meta-list">
              {dateDots ? (
                <div className="meta-row">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 4v4M16 4v4M4 11h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {dateDots}
                </div>
              ) : null}
              {eventTime ? (
                <div className="meta-row">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4.4l2.8 1.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {eventTime}
                </div>
              ) : null}
              {place ? (
                <div className="meta-row venue-name">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {venueName}
                </div>
              ) : null}
            </div>
            <div className="ornament">✦ 🪷 ✦</div>
            {showLive && isLive ? (
              <div className={styles.liveBadge}>
                <span /> LIVE NOW
              </div>
            ) : null}
          </header>

          {sections.showCountdown !== false && countdown ? (
            <section className="section countdown" id="countdown">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="countdown-bg" src={`${ASSET}/entirepg bg.png`} alt="" />
              <div className="countdown-inner">
                <div className="ornament">✦ 🪷 ✦</div>
                <h2 className="te-title">❦ వివాహానికి మిగిలిన సమయం ❦</h2>
                <div className="rule" />
                {countdown.ended ? (
                  <div className="ended">శుభమస్తు ❤️</div>
                ) : (
                  <div className="count-row" id="count-active">
                    {[
                      ["DAYS", countdown.days],
                      ["HOURS", countdown.hours],
                      ["MINUTES", countdown.minutes],
                      ["SECONDS", countdown.seconds],
                    ].map(([label, value]) => (
                      <div className="count-box" key={label}>
                        <div>🪷</div>
                        <strong>{pad(value)}</strong>
                        <small>{label}</small>
                      </div>
                    ))}
                  </div>
                )}
                <div className="heart-rule" aria-hidden="true">
                  <i />
                  <span>♥</span>
                  <i />
                </div>
              </div>
            </section>
          ) : null}

          {showLive ? (
            <section className={`section ${styles.liveSection}`} id="live">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="blessing-bg" src={`${ASSET}/entirepg bg.png`} alt="" />
              <div className="blessing-inner">
                <div className="ornament">🪷</div>
                <h2 className="te-title">❖ Live Streaming ❖</h2>
                <div className="rule" />
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
                    <div
                      className={styles.poster}
                      style={{ backgroundImage: `url(${cover || DEFAULT_POSTER})` }}
                      role={embed ? "button" : "img"}
                      tabIndex={embed ? 0 : undefined}
                      onClick={() => embed && setWatching(true)}
                      onKeyDown={(e) => {
                        if (embed && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setWatching(true);
                        }
                      }}
                    >
                      <span className={styles.posterShade} />
                      {embed ? (
                        <button type="button" className={styles.streamStatus} onClick={() => setWatching(true)}>
                          Watch Live
                        </button>
                      ) : (
                        <span className={styles.streamStatusMuted}>Stream starting soon</span>
                      )}
                    </div>
                  )}
                </div>
                {embed && event?.showWatchLive !== false ? (
                  <div className={styles.centerActions}>
                    <button type="button" className="intro-cta" onClick={() => setWatching(true)}>
                      {watching ? "Watching live" : "Watch Live"}
                    </button>
                    {event?.showSocialShare !== false && shareUrl ? (
                      <button type="button" className={styles.shareBtn} onClick={shareInvite}>
                        Share on WhatsApp
                      </button>
                    ) : null}
                  </div>
                ) : event?.showSocialShare !== false && shareUrl ? (
                  <div className={styles.centerActions}>
                    <button type="button" className={styles.shareBtn} onClick={shareInvite}>
                      Share on WhatsApp
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="section blessing" id="blessing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="blessing-bg" src={`${ASSET}/entirepg bg.png`} alt="" />
            <div className="blessing-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="blessing-ganesha" src={`${ASSET}/ganesh.png`} alt="Lord Ganesha" />
              <h2 className="en-title">Divine Blessings</h2>
              <div className="rule" />
              <p>{event?.description || DEFAULT_BLESSING}</p>
            </div>
          </section>

          {sections.showSubEvents !== false && event?.showSubEvents !== false && subEvents.length > 0 ? (
            <section className="section events" id="events">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="events-bg" src={`${ASSET}/entirepg bg.png`} alt="" />
              <div className="events-inner">
                <div className="events-kicker" aria-hidden="true">
                  <i />
                  <span>🪷</span>
                  <i />
                </div>
                <div className="events-heading">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="flourish" src={`${ASSET}/gold-flourish.svg`} alt="" />
                  <h2>కార్యక్రమములు</h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="flourish flip" src={`${ASSET}/gold-flourish.svg`} alt="" />
                </div>
                <div className="event-grid">{subEvents.map(renderSubEventCard)}</div>
                <div className="event-rail" aria-hidden="true">
                  <span className="dot" />
                  <span className="dot dark" />
                </div>
                <div className="event-foot" aria-hidden="true">
                  <i />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${ASSET}/gold-flourish.svg`} alt="" />
                  <i />
                </div>
              </div>
            </section>
          ) : null}

          <section className="section story" id="story">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="story-bg" src={`${ASSET}/entirepg bg.png`} alt="" />
            <div className="story-inner">
              <h2 className="en-title">❦ Our Journey ❦</h2>
              <div className="rule" />
              <div className="timeline">
                {storySteps.map((step, index) => (
                  <div className="step" key={step.title}>
                    <div className="rail">
                      <div className="glyph">{step.glyph}</div>
                      {index < storySteps.length - 1 ? <div className="rail-line" /> : null}
                    </div>
                    <div className="step-body">
                      <h3>{step.title}</h3>
                      <div className="rule" style={{ margin: "0 0 10px", marginLeft: 0 }} />
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {sections.showInvitationCard !== false && invitationCard ? (
            <section className="section invite" id="invitation">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="invite-bg" src={`${ASSET}/entirepg bg.png`} alt="" />
              <div className="invite-inner">
                <h2 className="te-title">మా వివాహ ఆహ్వానం</h2>
                <button
                  className={`envelope ${envelopeOpening ? "is-opening" : ""}`}
                  type="button"
                  aria-label="Open wedding invitation"
                  onClick={openInvite}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="envelope-art" src={`${ASSET}/envelope-full.png`} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="envelope-card" src={invitationCard} alt="Wedding invitation" />
                </button>
                <div className="invite-hint">{inviteOpen ? "OPEN INVITATION" : "TAP TO OPEN INVITATION"}</div>
              </div>
            </section>
          ) : null}

          {sections.showGallery !== false && galleryUrls.length > 0 ? (
            <section className="section gallery" id="gallery">
              <h2 className="en-title" style={{ fontFamily: "'Peddana', serif" }}>
                Moments
              </h2>
              <div className="rule" />
              <div className="g-grid">
                {galleryUrls.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    className={`g-item${idx % 3 === 0 ? " tall" : ""}`}
                    onClick={() => {
                      setLightboxIdx(idx);
                      setLightboxOpen(true);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Wedding moment" loading="lazy" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {place ? (
            <section className="section venue" id="venue">
              <div className="venue-deco" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vine vine-tl" src={`${ASSET}/venue-vine.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vine vine-br" src={`${ASSET}/venue-vine.svg`} alt="" />
                {[1, 2, 3, 4, 5].map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={n} className={`rose-petal rp${n}`} src={`${ASSET}/heart.svg`} alt="" />
                ))}
              </div>
              <div className="venue-head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="flourish" src={`${ASSET}/gold-flourish.svg`} alt="" />
                <h2>వేదిక</h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="flourish flip" src={`${ASSET}/gold-flourish.svg`} alt="" />
              </div>
              <div className="venue-divider" aria-hidden="true">
                <i />
                <span />
                <i />
              </div>
              <div className="venue-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-tl" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-tr" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-bl" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-br" src={`${ASSET}/card-corner.svg`} alt="" />
                <h3>{venueName}</h3>
                <div className="venue-line" aria-hidden="true" />
                <p>
                  <svg className="pin" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#c45c58" d="M12 2c-3.9 0-7 3-7 7 0 5.3 7 13 7 13s7-7.7 7-13c0-4-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  {place}
                </p>
                <a className="directions-btn" href={mapsUrl} target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 2c-3.9 0-7 3-7 7 0 5.3 7 13 7 13s7-7.7 7-13c0-4-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  GET DIRECTIONS
                </a>
              </div>
              <a className="cal-link" href={calendarUrl} target="_blank" rel="noreferrer">
                Add to Google Calendar
              </a>
            </section>
          ) : null}

          {showHosts ? (
            <section className="section hosts" id="hosts">
              <div className="family-deco" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vine vine-tl" src={`${ASSET}/venue-vine.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vine vine-br" src={`${ASSET}/venue-vine.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="rose-petal rp1" src={`${ASSET}/heart.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="rose-petal rp3" src={`${ASSET}/heart.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="rose-petal rp4" src={`${ASSET}/heart.svg`} alt="" />
              </div>
              <article className="hosts-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hosts-petal" src={`${ASSET}/heart.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-tl" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-tr" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-bl" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-br" src={`${ASSET}/card-corner.svg`} alt="" />
                <h2>మీ ఆగమనాభిలాషులు</h2>
                <div className="family-rule" aria-hidden="true">
                  <i />
                  <span />
                  <i />
                </div>
                {(hostImage1 || hostImage2) && (
                  <div className="hosts-pair">
                    {hostImage1 ? (
                      <div className="hosts-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hostImage1} alt="Host" />
                      </div>
                    ) : null}
                    {hostImage2 ? (
                      <div className="hosts-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hostImage2} alt="Host" />
                      </div>
                    ) : null}
                  </div>
                )}
                {hostCopy.names ? <p className="hosts-names">{hostCopy.names}</p> : null}
                {hostCopy.place ? <p className="hosts-place">{hostCopy.place}</p> : null}
              </article>
            </section>
          ) : null}

          {familyLines.length > 0 ? (
            <section className="section members" id="members">
              <div className="family-deco" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vine vine-tl" src={`${ASSET}/venue-vine.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vine vine-br" src={`${ASSET}/venue-vine.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="rose-petal rp2" src={`${ASSET}/heart.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="rose-petal rp4" src={`${ASSET}/heart.svg`} alt="" />
              </div>
              <article className="members-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-tl" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-tr" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-bl" src={`${ASSET}/card-corner.svg`} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="filigree fg-br" src={`${ASSET}/card-corner.svg`} alt="" />
                <h2>Family members</h2>
                {familyLines.map((line) => (
                  <div key={line}>
                    <div className="family-rule" aria-hidden="true">
                      <i />
                      <span />
                      <i />
                    </div>
                    <p>{line}</p>
                  </div>
                ))}
              </article>
            </section>
          ) : null}

          <footer className="final">
            <div className="script-name">
              {left}
              {right ? ` ♡ ${right}` : ""}
            </div>
            {dateBullets ? <div className="final-date">{dateBullets}</div> : null}
            <div className="final-love">With love, blessings &amp; happiness</div>
            <div className="final-om">॥ శుభమస్తు ॥</div>
          </footer>

          <div className="float-left">
            {musicAvailable ? (
              <button className="fab" type="button" aria-label="Toggle music" onClick={toggleMusic}>
                {musicPlaying ? "❚❚" : "♪"}
              </button>
            ) : null}
          </div>
          <div className="float-right">
            {phone ? (
              <a className="fab icon-fab" href={`tel:${phone}`} aria-label="Call">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ASSET}/icon-call.png`} alt="" />
              </a>
            ) : null}
            <button
              type="button"
              className="fab icon-fab wa"
              aria-label="Share on WhatsApp"
              onClick={shareInvite}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ASSET}/icon-whatsapp.png`} alt="" />
            </button>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio id="wtt-bgm" src={`${ASSET}/music.mp3`} loop onError={() => setMusicAvailable(false)} />
        </div>

        <div
          className={`modal ${inviteOpen ? "is-open" : ""}`}
          id="invite-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Wedding invitation"
          onClick={(e) => {
            if (e.target.id === "invite-modal") setInviteOpen(false);
          }}
        >
          <button className="modal-x" type="button" aria-label="Close" onClick={() => setInviteOpen(false)}>
            ✕
          </button>
          <article className="invite-sheet">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invitationCard} alt="Wedding invitation" />
          </article>
        </div>

        {galleryUrls.length > 0 ? (
          <div
            className={`modal ${lightboxOpen ? "is-open" : ""}`}
            id="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo"
            onClick={(e) => {
              if (e.target.id === "lightbox") setLightboxOpen(false);
            }}
          >
            <button className="modal-x" type="button" aria-label="Close" onClick={() => setLightboxOpen(false)}>
              ✕
            </button>
            <button
              className="lb-nav prev"
              type="button"
              aria-label="Previous"
              onClick={() => setLightboxIdx((i) => (i - 1 + galleryUrls.length) % galleryUrls.length)}
            >
              ‹
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="lightbox-img" src={galleryUrls[lightboxIdx]} alt="Wedding moment" />
            <button
              className="lb-nav next"
              type="button"
              aria-label="Next"
              onClick={() => setLightboxIdx((i) => (i + 1) % galleryUrls.length)}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
