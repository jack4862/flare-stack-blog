import { Disc3, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MusicPageProps } from "@/features/theme/contract/pages";
import type { TrackItem } from "@/features/music/tracks.schema";
import { activeLyricIndex, parseLyrics } from "@/features/music/lyrics";
import {
  formatPlayerTime,
  useMusicPlayer,
} from "@/features/theme/themes/yozora/components/music-player";
import { m } from "@/paraglide/messages";

type Panel = "lyrics" | "playlist";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function Sleeve({ track, playing }: { track: TrackItem; playing: boolean }) {
  return (
    <div className="yz-music__sleeve">
      {track.cover ? (
        <img src={track.cover} alt="" loading="lazy" decoding="async" />
      ) : (
        <Disc3 size={46} strokeWidth={1} aria-hidden="true" />
      )}
      <span
        className={
          playing
            ? "yz-music__sleeve-disc yz-music__sleeve-disc--spinning"
            : "yz-music__sleeve-disc"
        }
        aria-hidden="true"
      >
        <Disc3 size={22} strokeWidth={1.2} />
      </span>
    </div>
  );
}

export function MusicPage({ tracks }: MusicPageProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    selectTrack,
    toggle,
    next,
    previous,
    seek,
  } = useMusicPlayer();
  const [panel, setPanel] = useState<Panel>("lyrics");

  const track = currentTrack ?? tracks[0];
  const active = Boolean(track && currentTrack?.id === track.id);
  const lines = useMemo(() => parseLyrics(track?.lyrics), [track?.lyrics]);
  const activeLine = active ? activeLyricIndex(lines, currentTime) : -1;
  const activeLineRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [activeLine, track?.id]);

  if (!track) {
    return (
      <div className="yz-music fuwari-onload-animation">
        <div className="yz-shell">
          <header className="yz-book__head yz-music__head">
            <div className="yz-hero__pagemark">
              <span>Music · 音盤</span>
            </div>
            <h1 className="yz-book__title">{m.music_title()}</h1>
            <p className="yz-book__desc">{m.music_desc()}</p>
          </header>
          <div className="yz-music__empty">
            <Disc3 size={26} strokeWidth={1.1} aria-hidden="true" />
            <p>{m.music_empty()}</p>
          </div>
        </div>
      </div>
    );
  }

  const shownTime = active ? currentTime : 0;
  const shownDuration = active ? duration : track.duration || 0;
  const startOrToggle = () => {
    if (active) toggle();
    else selectTrack(track);
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

        <div className="yz-music__stage">
          <section className="yz-music__record" aria-label={m.music_now_playing()}>
            <Sleeve track={track} playing={isPlaying && active} />

            <div className="yz-music__record-meta">
              <h2 className="yz-music__record-title">{track.title}</h2>
              <p className="yz-music__record-sub">
                {[track.artist, track.album].filter(Boolean).join(" · ") ||
                  m.music_unknown_artist()}
              </p>
            </div>

            <div className="yz-music__record-progress">
              <span>{formatPlayerTime(shownTime)}</span>
              <input
                type="range"
                min={0}
                max={shownDuration || 0}
                step={0.1}
                value={Math.min(shownTime, shownDuration || 0)}
                disabled={!active}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label={m.music_progress()}
              />
              <span>{formatPlayerTime(shownDuration)}</span>
            </div>

            <div className="yz-music__record-controls">
              <button type="button" onClick={previous} aria-label={m.music_previous()}>
                <SkipBack size={18} strokeWidth={1.4} />
              </button>
              <button
                type="button"
                onClick={startOrToggle}
                aria-label={isPlaying && active ? m.music_pause() : m.music_play()}
                className="yz-music__record-play"
              >
                {isPlaying && active ? (
                  <Pause size={20} strokeWidth={1.5} />
                ) : (
                  <Play size={20} strokeWidth={1.5} />
                )}
              </button>
              <button type="button" onClick={next} aria-label={m.music_next()}>
                <SkipForward size={18} strokeWidth={1.4} />
              </button>
            </div>
          </section>

          <section className="yz-music__panel">
            <div className="yz-music__tabs" role="tablist" aria-label={m.music_title()}>
              <button
                type="button"
                role="tab"
                aria-selected={panel === "lyrics"}
                onClick={() => setPanel("lyrics")}
                className={panel === "lyrics" ? "active" : undefined}
              >
                {m.music_lyrics()}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={panel === "playlist"}
                onClick={() => setPanel("playlist")}
                className={panel === "playlist" ? "active" : undefined}
              >
                {m.music_playlist()} · {tracks.length}
              </button>
            </div>

            {panel === "lyrics" ? (
              lines.length > 0 ? (
                <ol className="yz-music__lyrics" aria-label={m.music_lyrics()}>
                  {lines.map((line, index) => (
                    <li
                      key={`${line.time ?? "plain"}-${index}`}
                      ref={index === activeLine ? activeLineRef : undefined}
                      className={
                        index === activeLine
                          ? "yz-music__lyric yz-music__lyric--active"
                          : "yz-music__lyric"
                      }
                    >
                      {line.text || "·"}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="yz-music__panel-empty">{m.music_no_lyrics()}</p>
              )
            ) : (
              <ol className="yz-music__playlist" aria-label={m.music_playlist()}>
                {tracks.map((item, index) => {
                  const itemActive = currentTrack?.id === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectTrack(item)}
                        className={itemActive ? "active" : undefined}
                        aria-current={itemActive ? "true" : undefined}
                      >
                        <span className="yz-music__playlist-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="yz-music__playlist-meta">
                          <span>{item.title}</span>
                          <small>
                            {item.artist || m.music_unknown_artist()} ·{" "}
                            {formatDuration(item.duration)}
                          </small>
                        </span>
                        <span className="yz-music__playlist-play" aria-hidden="true">
                          {itemActive && isPlaying ? "❚❚" : "▶"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function MusicPageSkeleton() {
  return (
    <div className="yz-music">
      <div className="yz-shell">
        <div className="yz-moments__skeleton-head" />
        <div className="yz-music__stage">
          <div className="yz-music__skeleton" />
          <div className="yz-music__skeleton" />
        </div>
      </div>
    </div>
  );
}
