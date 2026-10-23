import { and, eq, isNull } from "drizzle-orm";
import { TracksTable } from "@/lib/db/schema";

export async function insertTrack(
  db: DB,
  data: typeof TracksTable.$inferInsert,
) {
  const [track] = await db.insert(TracksTable).values(data).returning();
  return track;
}

export async function findTrackById(db: DB, id: number) {
  return await db.query.TracksTable.findFirst({
    where: and(eq(TracksTable.id, id), isNull(TracksTable.deletedAt)),
  });
}

export async function getAllTracks(db: DB) {
  return await db
    .select()
    .from(TracksTable)
    .where(isNull(TracksTable.deletedAt))
    .orderBy(TracksTable.sort, TracksTable.id);
}

export async function updateTrack(
  db: DB,
  id: number,
  data: Partial<
    Pick<
      typeof TracksTable.$inferInsert,
      "title" | "artist" | "album" | "duration" | "url" | "cover" | "lyrics" | "sort"
    >
  >,
) {
  const [track] = await db
    .update(TracksTable)
    .set(data)
    .where(and(eq(TracksTable.id, id), isNull(TracksTable.deletedAt)))
    .returning();
  return track;
}

export async function softDeleteTrack(db: DB, id: number) {
  const [track] = await db
    .update(TracksTable)
    .set({ deletedAt: new Date() })
    .where(and(eq(TracksTable.id, id), isNull(TracksTable.deletedAt)))
    .returning();
  return track;
}
