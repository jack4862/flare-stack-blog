import { describe, expect, it } from "vitest";
import { activeLyricIndex, parseLyrics } from "./lyrics";

describe("lyrics", () => {
  it("parses timestamped and plain lines", () => {
    const lines = parseLyrics(
      "[00:00.00]intro\n[00:04.50]first line\n[00:12.00]second line\n",
    );
    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual({ time: 0, text: "intro" });
    expect(lines[1]).toEqual({ time: 4.5, text: "first line" });
    expect(lines[2]).toEqual({ time: 12, text: "second line" });
  });

  it("keeps plain lines and sorts timed lines before them", () => {
    const lines = parseLyrics("plain\n[00:10.00]later\n[00:02.00]earlier");
    expect(lines.map((line) => line.text)).toEqual(["earlier", "later", "plain"]);
  });

  it("returns no lines for empty input", () => {
    expect(parseLyrics("")).toEqual([]);
    expect(parseLyrics(null)).toEqual([]);
  });

  it("finds the latest active timestamp", () => {
    const lines = parseLyrics("[00:00]a\n[00:05]b\n[00:10]c");
    expect(activeLyricIndex(lines, 0)).toBe(0);
    expect(activeLyricIndex(lines, 6)).toBe(1);
    expect(activeLyricIndex(lines, 99)).toBe(2);
    expect(activeLyricIndex(lines, -1)).toBe(-1);
  });
});
