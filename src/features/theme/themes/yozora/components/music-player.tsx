import { useQuery } from "@tanstack/react-query";
import { Disc3, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tracksQuery } from "@/features/music/queries";
import type { TrackItem } from "@/features/music/tracks.schema";
import { m } from "@/paraglide/messages";

export function formatPlayerTime(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type MusicPlayerContextValue = {
  tracks: Array<TrackItem>;
  currentTrack: TrackItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  selectTrack: (track: TrackItem) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data } = useQuery(tracksQuery());
  const tracks = data?.items ?? [];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);

  const currentTrack = useMemo(() => {
    if (!selectedTrack) return null;
    return tracks.find((track) => track.id === selectedTrack.id) ?? selectedTrack;
  }, [selectedTrack, tracks]);

  const duration = mediaDuration || currentTrack?.duration || 0;

  const selectTrack = (track: TrackItem) => {
    if (selectedTrack?.id === track.id) {
      setIsPlaying((value) => !value);
      return;
    }
    setSelectedTrack(track);
    setCurrentTime(0);
    setMediaDuration(0);
    setIsPlaying(true);
  };

  const toggle = () => {
    if (!currentTrack) {
      const first = tracks[0];
      if (first) {
        setSelectedTrack(first);
        setIsPlaying(true);
      }
      return;
    }
    setIsPlaying((value) => !value);
  };

  const step = (direction: 1 | -1) => {
    if (tracks.length === 0) return;
    const index = currentTrack
      ? tracks.findIndex((track) => track.id === currentTrack.id)
      : -1;
    const nextIndex =
      index < 0
        ? 0
        : (index + direction + tracks.length) % tracks.length;
    const nextTrack = tracks[nextIndex];
    if (!nextTrack) return;
    setSelectedTrack(nextTrack);
    setCurrentTime(0);
    setMediaDuration(0);
    setIsPlaying(true);
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    setCurrentTime(seconds);
    if (audio) audio.currentTime = seconds;
  };

  const stop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setSelectedTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setMediaDuration(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.getAttribute("src") !== currentTrack.url) {
      audio.src = currentTrack.url;
      audio.load();
      setCurrentTime(0);
      setMediaDuration(0);
    }

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  const value: MusicPlayerContextValue = {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    selectTrack,
    toggle,
    next: () => step(1),
    previous: () => step(-1),
    seek,
    stop,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(event) => {
          setMediaDuration(event.currentTarget.duration || 0);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => step(1)}
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const value = useContext(MusicPlayerContext);
  if (!value) {
    throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  }
  return value;
}

function PlayerCover({ track }: { track: TrackItem }) {
  return (
    <span className="yz-music__cover yz-music__cover--large">
      {track.cover ? (
        <img src={track.cover} alt="" loading="lazy" decoding="async" />
      ) : (
        <Disc3 size={26} strokeWidth={1.2} aria-hidden="true" />
      )}
    </span>
  );
}

/**
 * Persistent player rendered by PublicLayout. It lives outside route children,
 * so changing pages does not unmount the <audio> element or interrupt playback.
 */
export function GlobalMusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    toggle,
    next,
    previous,
    seek,
    stop,
  } = useMusicPlayer();

  if (!currentTrack) return null;

  return (
    <div
      className="yz-player yz-player--global"
      role="region"
      aria-label={m.music_now_playing()}
    >
      <div className="yz-player__track">
        <PlayerCover track={currentTrack} />
        <div className="yz-player__text">
          <span className="yz-player__title">{currentTrack.title}</span>
          <span className="yz-player__sub">
            {[currentTrack.artist, currentTrack.album].filter(Boolean).join(" · ") ||
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
          onClick={toggle}
          aria-label={isPlaying ? m.music_pause() : m.music_play()}
          className="yz-player__play"
        >
          {isPlaying ? (
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
        <span>{formatPlayerTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={m.music_progress()}
        />
        <span>{formatPlayerTime(duration)}</span>
      </div>

      <button
        type="button"
        className="yz-player__close"
        onClick={stop}
        aria-label={m.music_close()}
      >
        ×
      </button>
    </div>
  );
}
