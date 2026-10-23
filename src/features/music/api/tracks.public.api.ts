import { createServerFn } from "@tanstack/react-start";
import { dbMiddleware } from "@/lib/middlewares";
import * as TrackService from "../tracks.service";

export const getTracksFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return await TrackService.getTracks(context);
  });
