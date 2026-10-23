import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Disc3, FolderKanban, History, Sparkles } from "lucide-react";
import type { LibraryPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

const cards = [
  {
    key: "music",
    icon: Disc3,
    title: m.library_music_title(),
    desc: m.library_music_desc(),
    to: "/library/music" as const,
  },
  {
    key: "projects",
    icon: FolderKanban,
    title: m.library_projects_title(),
    desc: m.library_projects_desc(),
  },
  {
    key: "timeline",
    icon: History,
    title: m.library_timeline_title(),
    desc: m.library_timeline_desc(),
  },
  {
    key: "skills",
    icon: Sparkles,
    title: m.library_skills_title(),
    desc: m.library_skills_desc(),
  },
];

export function LibraryPage({ hasMusic, trackCount }: LibraryPageProps) {
  return (
    <div className="yz-library fuwari-onload-animation">
      <div className="yz-shell">
        <header className="yz-book__head yz-library__head">
          <div className="yz-hero__pagemark">
            <svg width="34" height="10" viewBox="0 0 34 10" fill="none" aria-hidden="true">
              <path d="M1 5h12" stroke="currentColor" strokeWidth=".8" />
              <path
                d="M18 1.6c3.2 0 3.2 6.8 6.4 6.8s3.2-6.8 6.4-6.8"
                stroke="var(--yz-gold)"
                strokeWidth=".8"
                fill="none"
              />
            </svg>
            <span>Library · 書架</span>
          </div>
          <h1 className="yz-book__title">{m.library_title()}</h1>
          <p className="yz-book__desc">{m.library_desc()}</p>
        </header>

        <div className="yz-library__grid">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const isMusic = card.key === "music";
            const inner = (
              <>
                <div className="yz-library__card-top">
                  <Icon size={22} strokeWidth={1.2} aria-hidden="true" />
                  <span className="yz-library__index">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="yz-library__card-title">{card.title}</h2>
                <p className="yz-library__card-desc">{card.desc}</p>
                <span className="yz-library__card-meta">
                  {isMusic
                    ? m.library_track_count({ count: trackCount })
                    : m.library_coming_soon()}
                  {isMusic ? (
                    <ArrowUpRight size={12} strokeWidth={1.4} aria-hidden="true" />
                  ) : null}
                </span>
              </>
            );

            return isMusic && hasMusic ? (
              <Link
                key={card.key}
                to="/library/music"
                className="yz-library__card yz-library__card--live fuwari-onload-animation"
                style={{ animationDelay: `${120 + index * 60}ms` }}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={card.key}
                className="yz-library__card yz-library__card--soon fuwari-onload-animation"
                style={{ animationDelay: `${120 + index * 60}ms` }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LibraryPageSkeleton() {
  return (
    <div className="yz-library">
      <div className="yz-shell">
        <div className="yz-moments__skeleton-head" />
        <div className="yz-library__grid">
          <div className="yz-library__skeleton" />
          <div className="yz-library__skeleton" />
        </div>
      </div>
    </div>
  );
}
