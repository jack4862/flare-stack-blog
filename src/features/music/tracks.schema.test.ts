import { describe, expect, it } from "vitest";
import {
  CreateTrackInputSchema,
  TrackItemSchema,
  UpdateTrackInputSchema,
} from "./tracks.schema";

describe("tracks schema", () => {
  it("applies defaults and trims a valid track", () => {
    const parsed = CreateTrackInputSchema.parse({
      title: "  雨のアリア  ",
      artist: "  雨月  ",
      url: "/audio/p2-aria.mp3",
    });

    expect(parsed.title).toBe("雨のアリア");
    expect(parsed.artist).toBe("雨月");
    expect(parsed.sort).toBe(0);
    expect(parsed.cover).toBeUndefined();
  });

  it("accepts relative and absolute audio URLs but rejects scripts", () => {
    expect(
      CreateTrackInputSchema.parse({
        title: "t",
        url: "https://cdn.example.com/a.mp3",
      }).url,
    ).toBe("https://cdn.example.com/a.mp3");

    expect(() =>
      CreateTrackInputSchema.parse({ title: "t", url: "javascript:alert(1)" }),
    ).toThrow();
  });

  it("rejects a blank title and invalid cover", () => {
    expect(() =>
      CreateTrackInputSchema.parse({ title: "  ", url: "/audio/a.mp3" }),
    ).toThrow();
    expect(() =>
      CreateTrackInputSchema.parse({
        title: "t",
        url: "/audio/a.mp3",
        cover: "javascript:alert(1)",
      }),
    ).toThrow();
  });

  it("validates duration bounds", () => {
    expect(
      CreateTrackInputSchema.parse({
        title: "t",
        url: "/audio/a.mp3",
        duration: 24,
      }).duration,
    ).toBe(24);
    expect(() =>
      CreateTrackInputSchema.parse({
        title: "t",
        url: "/audio/a.mp3",
        duration: 99999,
      }),
    ).toThrow();
  });

  it("allows partial updates", () => {
    const parsed = UpdateTrackInputSchema.parse({
      id: 3,
      title: "new title",
      sort: 2,
    });
    expect(parsed.id).toBe(3);
    expect(parsed.title).toBe("new title");
    expect(parsed.url).toBeUndefined();
  });

  it("parses serialized dates from the API", () => {
    const parsed = TrackItemSchema.parse({
      id: 1,
      title: "t",
      artist: null,
      album: null,
      duration: 24,
      url: "/audio/a.mp3",
      cover: null,
      lyrics: null,
      sort: 0,
      createdAt: "2026-10-22T12:00:00.000Z",
      updatedAt: "2026-10-22T12:00:00.000Z",
    });
    expect(parsed.createdAt).toBeInstanceOf(Date);
  });
});
