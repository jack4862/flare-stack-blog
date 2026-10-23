import { queryOptions } from "@tanstack/react-query";
import { getAdminTracksFn } from "../api/tracks.admin.api";
import { getTracksFn } from "../api/tracks.public.api";

export const TRACKS_KEYS = {
  all: ["tracks"] as const,
  list: ["tracks", "list"] as const,
  admin: ["tracks", "admin"] as const,
};

export function tracksQuery() {
  return queryOptions({
    queryKey: TRACKS_KEYS.list,
    queryFn: () => getTracksFn(),
    staleTime: 60_000,
  });
}

export function adminTracksQuery() {
  return queryOptions({
    queryKey: TRACKS_KEYS.admin,
    queryFn: () => getAdminTracksFn(),
  });
}
