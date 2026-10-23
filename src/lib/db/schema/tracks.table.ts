import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./helper";

export const TracksTable = sqliteTable(
  "tracks",
  {
    id,
    title: text().notNull(),
    artist: text(),
    album: text(),
    duration: integer(),
    url: text().notNull(),
    cover: text(),
    sort: integer().notNull().default(0),
    createdAt,
    updatedAt,
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [index("idx_tracks_sort").on(table.sort)],
);

export type Track = typeof TracksTable.$inferSelect;
