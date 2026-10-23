import { Disc3 } from "lucide-react";
import type { MusicPageProps } from "@/features/theme/contract/pages";
import type { TrackItem } from "@/features/music/tracks.schema";
import { useMusicPlayer } from "@/features/theme/themes/yozora/components/music-player";
import { m } from "@/paraglide/messages";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function Cover({ track }: { track: TrackItem }) {
  return (
    <span className="yz-music__cover">
      {track.cover ? (
        <img src={track.cover} alt="" loading="lazy" decoding="async" />
      ) : (
        <Disc3 size={18} strokeWidth={1.2} aria-hidden="true" />
      )}
    </span>
  );
}

export function MusicPage({ tracks }: MusicPageProps) {
  const { currentTrack, selectTrack } = useMusicPlayer();

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
          <ol className="yz-music__list">
            {tracks.map((item, index) => {
              const active = currentTrack?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectTrack(item)}
                    className={
                      active
                        ? "yz-music__row yz-music__row--active"
                        : "yz-music__row"
                    }
                    aria-current={active ? "true" : undefined}
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
                      {formatDuration(item.duration)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
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
