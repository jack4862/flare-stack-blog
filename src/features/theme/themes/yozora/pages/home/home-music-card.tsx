import { Link } from "@tanstack/react-router";
import { Disc3, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import {
  formatPlayerTime,
  useMusicPlayer,
} from "@/features/theme/themes/yozora/components/music-player";
import { m } from "@/paraglide/messages";

/**
 * Home hero music card: lets playback start from the front page, without
 * opening /library/music first. It shares the same MusicPlayerProvider as the
 * persistent bottom player.
 */
export function HomeMusicCard() {
  const {
    tracks,
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

  if (tracks.length === 0) return null;

  const track = currentTrack ?? tracks[0];
  const active = currentTrack?.id === track.id;
  const shownTime = active ? currentTime : 0;
  const shownDuration = active ? duration : track.duration || 0;

  const startOrToggle = () => {
    if (active) {
      toggle();
    } else {
      selectTrack(track);
    }
  };

  return (
    <div className="yz-home-player">
      <div className="yz-home-player__head">
        <span>{active ? m.music_now_playing() : m.home_music_label()}</span>
        <Link to="/library/music" className="yz-home-player__link">
          {m.home_music_open()} ↗
        </Link>
      </div>

      <div className="yz-home-player__body">
        <button
          type="button"
          className="yz-home-player__cover"
          onClick={startOrToggle}
          aria-label={isPlaying && active ? m.music_pause() : m.music_play()}
        >
          {track.cover ? (
            <img src={track.cover} alt="" loading="lazy" decoding="async" />
          ) : (
            <Disc3 size={24} strokeWidth={1.2} aria-hidden="true" />
          )}
          <span className="yz-home-player__cover-icon" aria-hidden="true">
            {isPlaying && active ? (
              <Pause size={15} strokeWidth={1.6} />
            ) : (
              <Play size={15} strokeWidth={1.6} />
            )}
          </span>
        </button>

        <div className="yz-home-player__meta">
          <span className="yz-home-player__title">{track.title}</span>
          <span className="yz-home-player__artist">
            {[track.artist, track.album].filter(Boolean).join(" · ") ||
              m.music_unknown_artist()}
          </span>
        </div>

        <div className="yz-home-player__controls">
          <button type="button" onClick={previous} aria-label={m.music_previous()}>
            <SkipBack size={13} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            onClick={startOrToggle}
            aria-label={isPlaying && active ? m.music_pause() : m.music_play()}
            className="yz-home-player__play"
          >
            {isPlaying && active ? (
              <Pause size={14} strokeWidth={1.6} />
            ) : (
              <Play size={14} strokeWidth={1.6} />
            )}
          </button>
          <button type="button" onClick={next} aria-label={m.music_next()}>
            <SkipForward size={13} strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <div className="yz-home-player__progress">
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
    </div>
  );
}
