'use client';

import { useRef, useState } from 'react';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

const VolumeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
  </svg>
);

const MuteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
    <path d="M17 9.5l4 5M21 9.5l-4 5" />
  </svg>
);

const FullscreenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);

const BigPlayIcon = () => (
  <svg viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="38" fill="rgba(12,15,10,.45)" stroke="#fff" strokeWidth="2" />
    <path d="M33 26v28l23-14z" fill="#fff" />
  </svg>
);

function fmt(t: number): string {
  const safe = Number.isFinite(t) && t > 0 ? t : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

type Props = {
  src: string;
  poster: string;
  width: number;
  height: number;
  fallbackText: string;
};

/** Themed player from app.js, rebuilt on React state; class names match globals.css. */
export default function VideoPlayer({ src, poster, width, height, fallbackText }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  /** Non-null only while the user is dragging the seek bar. */
  const [scrubPct, setScrubPct] = useState<number | null>(null);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function commitScrub() {
    const video = videoRef.current;
    if (scrubPct === null) return;
    if (video && duration) video.currentTime = (duration * scrubPct) / 100;
    setScrubPct(null);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const wrap = wrapRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (wrap?.requestFullscreen) void wrap.requestFullscreen();
    else video?.webkitEnterFullscreen?.();
  }

  const seekValue = scrubPct ?? (duration ? (currentTime / duration) * 100 : 0);
  const shownTime = scrubPct !== null ? (duration * scrubPct) / 100 : currentTime;

  return (
    <div ref={wrapRef} className={`player ${playing ? 'playing' : 'paused'}`}>
      <video
        ref={videoRef}
        className="post-video"
        preload="none"
        playsInline
        width={width}
        height={height}
        poster={poster}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted || e.currentTarget.volume === 0)}
      >
        <source src={src} type="video/mp4" />
        {fallbackText}
      </video>

      <button type="button" className="pl-big" aria-label="Пусни видео / Play" onClick={togglePlay}>
        <BigPlayIcon />
      </button>

      <div className="pl-bar">
        <button
          type="button"
          className="pl-btn pl-play"
          aria-label="Пусни / пауза"
          onClick={togglePlay}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <input
          type="range"
          className="pl-seek"
          min={0}
          max={100}
          step={0.1}
          value={seekValue}
          aria-label="Позиция във видеото"
          onChange={(e) => setScrubPct(Number(e.currentTarget.value))}
          onPointerUp={commitScrub}
          onKeyUp={commitScrub}
          onBlur={commitScrub}
        />
        {/* Duration is unknown until metadata loads, and preload="none" defers that until play. */}
        <span className="pl-time">
          {duration ? `${fmt(shownTime)} / ${fmt(duration)}` : fmt(shownTime)}
        </span>
        <button
          type="button"
          className="pl-btn pl-mute"
          aria-label="Заглуши / включи звук"
          onClick={() => {
            const video = videoRef.current;
            if (video) video.muted = !video.muted;
          }}
        >
          {muted ? <MuteIcon /> : <VolumeIcon />}
        </button>
        <button
          type="button"
          className="pl-btn pl-full"
          aria-label="Цял екран"
          onClick={toggleFullscreen}
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}
