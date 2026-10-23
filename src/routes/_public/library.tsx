import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import theme from "@theme";
import { requireFeature } from "@/features/config/features";
import { siteConfigQuery } from "@/features/config/queries";
import { tracksQuery } from "@/features/music/queries";
import type { ThemeComponents } from "@/features/theme/contract/components";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/library")({
  beforeLoad: async ({ context }) => {
    const siteConfig = await context.queryClient.ensureQueryData(
      siteConfigQuery,
    );
    requireFeature(siteConfig, "library");
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tracksQuery());
    return {
      title: m.library_title(),
      description: m.library_desc(),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title },
      { name: "description", content: loaderData?.description },
    ],
  }),
  component: LibraryRoute,
});

function LibraryRoute() {
  const location = useLocation();
  const { data } = useSuspenseQuery(tracksQuery());
  const Page = (theme as Partial<ThemeComponents>).LibraryPage;

  // /library is a layout for its child pages; only render the hub at its own path.
  if (location.pathname !== "/library") {
    return <Outlet />;
  }

  if (!Page) {
    throw notFound();
  }

  return <Page hasMusic={data.items.length > 0} trackCount={data.items.length} />;
}
