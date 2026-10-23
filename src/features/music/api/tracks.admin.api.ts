import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware } from "@/lib/middlewares";
import {
  CreateTrackInputSchema,
  DeleteTrackInputSchema,
  UpdateTrackInputSchema,
} from "../tracks.schema";
import * as TrackService from "../tracks.service";

export const getAdminTracksFn = createServerFn()
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    return await TrackService.getAdminTracks(context);
  });

export const createTrackFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(CreateTrackInputSchema)
  .handler(async ({ data, context }) => {
    return await TrackService.createTrack(context, data);
  });

export const updateTrackFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(UpdateTrackInputSchema)
  .handler(async ({ data, context }) => {
    return await TrackService.updateTrack(context, data);
  });

export const deleteTrackFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(DeleteTrackInputSchema)
  .handler(async ({ data, context }) => {
    return await TrackService.deleteTrack(context, data);
  });
