export interface LyricLine {
  time: number | null;
  text: string;
}

const TIMESTAMP = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)$/;

/**
 * Parses LRC-ish lyric text. Timestamped lines become seekable lines; plain
 * lines are kept with a null time so they can still be displayed.
 */
export function parseLyrics(raw: string | null | undefined): Array<LyricLine> {
  if (!raw?.trim()) return [];

  const lines: Array<LyricLine> = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(TIMESTAMP);
    if (!match) {
      lines.push({ time: null, text: line });
      continue;
    }

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const fractionRaw = match[3] ?? "0";
    const fraction = Number(fractionRaw) / 10 ** fractionRaw.length;
    const text = (match[4] ?? "").trim();
    lines.push({ time: minutes * 60 + seconds + fraction, text });
  }

  // LRC files are usually ordered; sort only timestamped lines stably.
  return lines.sort((a, b) => {
    if (a.time === null) return b.time === null ? 0 : 1;
    if (b.time === null) return -1;
    return a.time - b.time;
  });
}

export function activeLyricIndex(
  lines: Array<LyricLine>,
  currentTime: number,
): number {
  let active = -1;
  for (let i = 0; i < lines.length; i++) {
    const time = lines[i]?.time;
    if (time !== null && time !== undefined && time <= currentTime) {
      active = i;
    }
  }
  return active;
}
