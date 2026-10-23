import * as CacheService from "@/features/cache/cache.service";
import { CACHE_NAMESPACES } from "@/features/cache/types";
import { err, ok } from "@/lib/errors";
import { purgeCDNCache } from "@/lib/invalidate";
import * as TrackRepo from "./data/tracks.data";
import {
  type CreateTrackInput,
  type DeleteTrackInput,
  TRACKS_CACHE_KEYS,
  TracksListResponseSchema,
  type UpdateTrackInput,
} from "./tracks.schema";

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function invalidateCache(context: DbContext & { executionCtx: ExecutionContext }) {
  context.executionCtx.waitUntil(
    Promise.all([
      CacheService.bumpVersion(context, CACHE_NAMESPACES.TRACKS_LIST),
      purgeCDNCache(context.env, { urls: ["/library", "/library/music"] }),
    ]),
  );
}

export async function getTracks(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  const version = await CacheService.getVersion(
    context,
    CACHE_NAMESPACES.TRACKS_LIST,
  );
  const cacheKey = TRACKS_CACHE_KEYS.list(version);

  return await CacheService.get(
    context,
    cacheKey,
    TracksListResponseSchema,
    async () => {
      const items = await TrackRepo.getAllTracks(context.db);
      return TracksListResponseSchema.parse({ items });
    },
    { ttl: "1h" },
  );
}

export async function getAdminTracks(context: DbContext) {
  const items = await TrackRepo.getAllTracks(context.db);
  return TracksListResponseSchema.parse({ items });
}

export async function createTrack(
  context: DbContext & { executionCtx: ExecutionContext },
  data: CreateTrackInput,
) {
  const track = await TrackRepo.insertTrack(context.db, {
    title: data.title,
    artist: normalizeText(data.artist),
    album: normalizeText(data.album),
    duration: data.duration ?? null,
    url: data.url,
    cover: normalizeText(data.cover),
    lyrics: normalizeText(data.lyrics),
    sort: data.sort,
  });

  invalidateCache(context);
  return track;
}

export async function updateTrack(
  context: DbContext & { executionCtx: ExecutionContext },
  data: UpdateTrackInput,
) {
  const existing = await TrackRepo.findTrackById(context.db, data.id);
  if (!existing) {
    return err({ reason: "NOT_FOUND" });
  }

  const { id, ...values } = data;
  const track = await TrackRepo.updateTrack(context.db, id, {
    ...(values.title !== undefined ? { title: values.title } : {}),
    ...(values.artist !== undefined
      ? { artist: normalizeText(values.artist) }
      : {}),
    ...(values.album !== undefined
      ? { album: normalizeText(values.album) }
      : {}),
    ...(values.duration !== undefined ? { duration: values.duration } : {}),
    ...(values.url !== undefined ? { url: values.url } : {}),
    ...(values.cover !== undefined
      ? { cover: normalizeText(values.cover) }
      : {}),
    ...(values.lyrics !== undefined
      ? { lyrics: normalizeText(values.lyrics) }
      : {}),
    ...(values.sort !== undefined ? { sort: values.sort } : {}),
  });

  invalidateCache(context);
  return ok(track);
}

export async function deleteTrack(
  context: DbContext & { executionCtx: ExecutionContext },
  data: DeleteTrackInput,
) {
  const existing = await TrackRepo.findTrackById(context.db, data.id);
  if (!existing) {
    return err({ reason: "NOT_FOUND" });
  }

  await TrackRepo.softDeleteTrack(context.db, data.id);
  invalidateCache(context);
  return ok({ success: true });
}
