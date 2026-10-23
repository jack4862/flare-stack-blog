import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import theme from "@theme";
import { requireFeature } from "@/features/config/features";
import { siteConfigQuery } from "@/features/config/queries";
import { tracksQuery } from "@/features/music/queries";
import type { ThemeComponents } from "@/features/theme/contract/components";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/library/music")({
  beforeLoad: async ({ context }) => {
    const siteConfig = await context.queryClient.ensureQueryData(
      siteConfigQuery,
    );
    requireFeature(siteConfig, "library");
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tracksQuery());
    return {
      title: m.music_title(),
      description: m.music_desc(),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title },
      { name: "description", content: loaderData?.description },
    ],
  }),
  component: MusicRoute,
});

function MusicRoute() {
  const { data } = useSuspenseQuery(tracksQuery());
  const Page = (theme as Partial<ThemeComponents>).MusicPage;

  if (!Page) {
    throw notFound();
  }

  return <Page tracks={data.items} />;
}
