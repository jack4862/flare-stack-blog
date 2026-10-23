import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Disc3, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createTrackFn,
  deleteTrackFn,
  updateTrackFn,
} from "@/features/music/api/tracks.admin.api";
import {
  adminTracksQuery,
  TRACKS_KEYS,
} from "@/features/music/queries";
import type { TrackItem } from "@/features/music/tracks.schema";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/music/")({
  ssr: false,
  component: MusicAdminPage,
  loader: () => ({ title: m.music_admin_title() }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title }],
  }),
});

type Draft = {
  id?: number;
  title: string;
  artist: string;
  album: string;
  url: string;
  cover: string;
  lyrics: string;
  duration: string;
  sort: string;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  artist: "",
  album: "",
  url: "",
  cover: "",
  lyrics: "",
  duration: "",
  sort: "0",
};

function toDraft(track: TrackItem): Draft {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist ?? "",
    album: track.album ?? "",
    url: track.url,
    cover: track.cover ?? "",
    lyrics: track.lyrics ?? "",
    duration: track.duration ? String(track.duration) : "",
    sort: String(track.sort),
  };
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function MusicAdminPage() {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(adminTracksQuery());
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [deleteTarget, setDeleteTarget] = useState<TrackItem | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: TRACKS_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (input: {
      title: string;
      artist: string | null;
      album: string | null;
      url: string;
      cover: string | null;
      lyrics: string | null;
      duration: number | null;
      sort: number;
    }) => createTrackFn({ data: input }),
    onSuccess: async () => {
      await invalidate();
      setDraft(EMPTY_DRAFT);
      toast.success(m.music_admin_saved());
    },
    onError: () => toast.error(m.music_admin_error()),
  });

  const updateMutation = useMutation({
    mutationFn: (input: {
      id: number;
      title: string;
      artist: string | null;
      album: string | null;
      url: string;
      cover: string | null;
      lyrics: string | null;
      duration: number | null;
      sort: number;
    }) => updateTrackFn({ data: input }),
    onSuccess: async () => {
      await invalidate();
      toast.success(m.music_admin_saved());
    },
    onError: () => toast.error(m.music_admin_error()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTrackFn({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
      setDeleteTarget(null);
      setDraft((current) =>
        current.id === deleteTarget?.id ? EMPTY_DRAFT : current,
      );
      toast.success(m.music_admin_deleted());
    },
    onError: () => toast.error(m.music_admin_error()),
  });

  const tracks = data?.items ?? [];
  const isEditing = draft.id !== undefined;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canSave = draft.title.trim().length > 0 && draft.url.trim().length > 0;

  const save = () => {
    if (!canSave) {
      toast.error(m.music_admin_error());
      return;
    }
    const payload = {
      title: draft.title.trim(),
      artist: draft.artist.trim() || null,
      album: draft.album.trim() || null,
      url: draft.url.trim(),
      cover: draft.cover.trim() || null,
      lyrics: draft.lyrics.trim() || null,
      duration: draft.duration ? Number(draft.duration) : null,
      sort: Number(draft.sort) || 0,
    };

    if (draft.id !== undefined) {
      updateMutation.mutate({ id: draft.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">
            {m.music_admin_title()}
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            {m.music_admin_tag()}
          </p>
        </div>
        <Button
          onClick={() => setDraft(EMPTY_DRAFT)}
          className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-[10px] uppercase tracking-widest h-9 px-4"
        >
          <Plus size={14} className="mr-2" />
          {m.music_admin_new()}
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
              {m.music_admin_list()}
            </h2>
            <span className="text-[10px] font-mono text-muted-foreground">
              {m.music_admin_count({ count: tracks.length })}
            </span>
          </div>

          {isPending ? (
            <div className="h-40 border border-border/30 bg-muted/20 animate-pulse" />
          ) : error ? (
            <p className="text-sm text-destructive">{m.music_admin_error()}</p>
          ) : tracks.length === 0 ? (
            <div className="border border-dashed border-border/40 px-6 py-16 text-center">
              <Disc3 className="mx-auto mb-4 text-muted-foreground" size={24} strokeWidth={1.2} />
              <p className="text-sm text-muted-foreground">{m.music_admin_empty()}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/30 border-y border-border/30">
              {tracks.map((track) => (
                <li key={track.id} className="flex items-start justify-between gap-4 py-4">
                  <button
                    type="button"
                    onClick={() => setDraft(toDraft(track))}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="text-foreground">{track.title}</span>
                      <span>{formatDuration(track.duration)}</span>
                      <span>#{track.sort}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {[track.artist, track.album].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground/70">
                      {track.url}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDraft(toDraft(track))}
                      aria-label={m.music_admin_edit()}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil size={13} strokeWidth={1.4} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(track)}
                      aria-label={m.music_admin_delete()}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={13} strokeWidth={1.4} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="h-fit border border-border/30 bg-background p-5 xl:sticky xl:top-24">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/30 pb-3">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-mono text-foreground">
              {isEditing ? m.music_admin_edit() : m.music_admin_new()}
            </h2>
            {isEditing ? (
              <button
                type="button"
                onClick={() => setDraft(EMPTY_DRAFT)}
                className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {m.music_admin_cancel()}
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {m.music_admin_title_label()}
              </span>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                className="h-9 rounded-none border-border/40 bg-background text-sm focus-visible:ring-0 focus-visible:border-foreground"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {m.music_admin_artist()}
                </span>
                <Input
                  value={draft.artist}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, artist: event.target.value }))
                  }
                  className="h-9 rounded-none border-border/40 bg-background text-sm focus-visible:ring-0 focus-visible:border-foreground"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {m.music_admin_album()}
                </span>
                <Input
                  value={draft.album}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, album: event.target.value }))
                  }
                  className="h-9 rounded-none border-border/40 bg-background text-sm focus-visible:ring-0 focus-visible:border-foreground"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {m.music_admin_url()}
              </span>
              <Input
                value={draft.url}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, url: event.target.value }))
                }
                className="h-9 rounded-none border-border/40 bg-background font-mono text-xs focus-visible:ring-0 focus-visible:border-foreground"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {m.music_admin_cover()}
              </span>
              <Input
                value={draft.cover}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, cover: event.target.value }))
                }
                className="h-9 rounded-none border-border/40 bg-background font-mono text-xs focus-visible:ring-0 focus-visible:border-foreground"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {m.music_admin_lyrics()}
              </span>
              <Textarea
                value={draft.lyrics}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, lyrics: event.target.value }))
                }
                rows={5}
                className="resize-y rounded-none border-border/40 bg-background font-mono text-xs focus-visible:ring-0 focus-visible:border-foreground"
              />
              <span className="block text-[10px] leading-relaxed text-muted-foreground">
                {m.music_admin_lyrics_hint()}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {m.music_admin_duration()}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={7200}
                  value={draft.duration}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, duration: event.target.value }))
                  }
                  className="h-9 rounded-none border-border/40 bg-background font-mono text-xs focus-visible:ring-0 focus-visible:border-foreground"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {m.music_admin_sort()}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={draft.sort}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, sort: event.target.value }))
                  }
                  className="h-9 rounded-none border-border/40 bg-background font-mono text-xs focus-visible:ring-0 focus-visible:border-foreground"
                />
              </label>
            </div>

            <Button
              onClick={save}
              disabled={!canSave || isSaving}
              className="h-10 w-full rounded-none bg-foreground font-mono text-[10px] uppercase tracking-[0.2em] text-background hover:bg-foreground/90"
            >
              {isSaving ? m.music_admin_saving() : m.music_admin_save()}
            </Button>
          </div>
        </aside>
      </div>

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title={m.music_admin_delete()}
        message={m.music_admin_delete_confirm()}
        confirmLabel={m.music_admin_delete()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
