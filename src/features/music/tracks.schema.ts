import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { TracksTable } from "@/lib/db/schema";

const coercedDate = z.union([z.date(), z.string().pipe(z.coerce.date())]);
const coercedDateNullable = coercedDate.nullable();

export const TrackSelectSchema = createSelectSchema(TracksTable, {
  createdAt: coercedDate,
  updatedAt: coercedDate,
  deletedAt: coercedDateNullable,
});

export const TrackItemSchema = TrackSelectSchema.omit({ deletedAt: true });

const assetUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "INVALID_ASSET_URL",
  );

export const CreateTrackInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  artist: z.string().trim().max(120).nullish(),
  album: z.string().trim().max(120).nullish(),
  duration: z.number().int().min(0).max(7200).nullish(),
  url: assetUrlSchema,
  cover: assetUrlSchema.nullish(),
  sort: z.number().int().min(0).max(10000).default(0),
});

export const UpdateTrackInputSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(200).optional(),
  artist: z.string().trim().max(120).nullable().optional(),
  album: z.string().trim().max(120).nullable().optional(),
  duration: z.number().int().min(0).max(7200).nullable().optional(),
  url: assetUrlSchema.optional(),
  cover: assetUrlSchema.nullable().optional(),
  sort: z.number().int().min(0).max(10000).optional(),
});

export const DeleteTrackInputSchema = z.object({
  id: z.number().int().positive(),
});

export const TracksListResponseSchema = z.object({
  items: z.array(TrackItemSchema),
});

export const TRACKS_CACHE_KEYS = {
  list: (version: string) => ["tracks", "list", version] as const,
} as const;

export type CreateTrackInput = z.infer<typeof CreateTrackInputSchema>;
export type UpdateTrackInput = z.infer<typeof UpdateTrackInputSchema>;
export type DeleteTrackInput = z.infer<typeof DeleteTrackInputSchema>;
export type TrackItem = z.infer<typeof TrackItemSchema>;
export type TracksListResponse = z.infer<typeof TracksListResponseSchema>;
