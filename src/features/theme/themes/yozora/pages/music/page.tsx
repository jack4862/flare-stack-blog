import {
  Disc3,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MusicPageProps } from "@/features/theme/contract/pages";
import type { TrackItem } from "@/features/music/tracks.schema";
import { m } from "@/paraglide/messages";

function formatTime(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

function Cover({ track, large = false }: { track: TrackItem; large?: boolean }) {
  const className = large ? "yz-music__cover yz-music__cover--large" : "yz-music__cover";
  return (
    <span className={className}>
      {track.cover ? (
        <img src={track.cover} alt="" loading="lazy" decoding="async" />
      ) : (
        <Disc3 size={large ? 26 : 18} strokeWidth={1.2} aria-hidden="true" />
      )}
    </span>
  );
}

export function MusicPage({ tracks }: MusicPageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);

  const track = tracks[current];
  const duration = useMemo(
    () => mediaDuration || track?.duration || 0,
    [mediaDuration, track?.duration],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.getAttribute("src") !== track.url) {
      audio.src = track.url;
      audio.load();
      setCurrentTime(0);
      setMediaDuration(0);
    }
    if (playing) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [current, playing, track]);

  const select = (index: number) => {
    setCurrent(index);
    setPlaying(true);
  };

  const previous = () => {
    setCurrent((value) => (value - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  };

  const next = () => {
    setCurrent((value) => (value + 1) % tracks.length);
    setPlaying(true);
  };

  return (
    <div className="yz-music fuwari-onload-animation">
      <div className="yz-shell">
        <header className="yz-book__head yz-music__head">
          <div className="yz-hero__pagemark">
            <svg width="34" height="10" viewBox="0 0 34 10" fill="none" aria-hidden="true">
              <path d="M1 5h12" stroke="currentColor" strokeWidth=".8" />
              <path
                d="M18 1.6c3.2 0 3.2 6.8 6.4 6.8s3.2-6.8 6.4-6.8"
                stroke="var(--yz-gold)"
                strokeWidth=".8"
                fill="none"
              />
            </svg>
            <span>Music · 音盤</span>
          </div>
          <h1 className="yz-book__title">{m.music_title()}</h1>
          <p className="yz-book__desc">{m.music_desc()}</p>
        </header>

        {tracks.length === 0 ? (
          <div className="yz-music__empty">
            <Disc3 size={26} strokeWidth={1.1} aria-hidden="true" />
            <p>{m.music_empty()}</p>
          </div>
        ) : (
          <>
            <ol className="yz-music__list">
              {tracks.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => select(index)}
                    className={
                      current === index
                        ? "yz-music__row yz-music__row--active"
                        : "yz-music__row"
                    }
                    aria-current={current === index ? "true" : undefined}
                  >
                    <span className="yz-music__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Cover track={item} />
                    <span className="yz-music__meta">
                      <span className="yz-music__title">{item.title}</span>
                      <span className="yz-music__sub">
                        {[item.artist, item.album].filter(Boolean).join(" · ") ||
                          m.music_unknown_artist()}
                      </span>
                    </span>
                    <span className="yz-music__duration">
                      {formatTime(item.duration)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="yz-player">
              <audio
                ref={audioRef}
                preload="metadata"
                onLoadedMetadata={(event) => {
                  setMediaDuration(event.currentTarget.duration || 0);
                }}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={next}
              />

              <div className="yz-player__track">
                <Cover track={track} large />
                <div className="yz-player__text">
                  <span className="yz-player__title">{track.title}</span>
                  <span className="yz-player__sub">
                    {[track.artist, track.album].filter(Boolean).join(" · ") ||
                      m.music_unknown_artist()}
                  </span>
                </div>
              </div>

              <div className="yz-player__controls">
                <button type="button" onClick={previous} aria-label={m.music_previous()}>
                  <SkipBack size={15} strokeWidth={1.4} />
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying((value) => !value)}
                  aria-label={playing ? m.music_pause() : m.music_play()}
                  className="yz-player__play"
                >
                  {playing ? (
                    <Pause size={16} strokeWidth={1.5} />
                  ) : (
                    <Play size={16} strokeWidth={1.5} />
                  )}
                </button>
                <button type="button" onClick={next} aria-label={m.music_next()}>
                  <SkipForward size={15} strokeWidth={1.4} />
                </button>
              </div>

              <div className="yz-player__progress">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => {
                    const audio = audioRef.current;
                    const value = Number(event.target.value);
                    setCurrentTime(value);
                    if (audio) audio.currentTime = value;
                  }}
                  aria-label={m.music_progress()}
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function MusicPageSkeleton() {
  return (
    <div className="yz-music">
      <div className="yz-shell">
        <div className="yz-moments__skeleton-head" />
        <div className="yz-music__skeleton" />
        <div className="yz-music__skeleton" />
      </div>
    </div>
  );
}
