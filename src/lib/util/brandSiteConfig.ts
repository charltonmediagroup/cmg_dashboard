import type { Brand } from "@/lib/entities";

export interface ResolvedSiteConfig {
  name: string;
  url?: string;
  image?: string;
  exclusivesUrl?: string;
  exclusiveFeed?: string;
  videosFeed?: string;
  ArticlesFeed?: string;
}

// Builds the siteConfig a BrandDashboard consumes, applying any custom feed
// overrides from /admin/brands. Custom URLs are served through the server-side
// proxy (external sites don't send CORS headers); "off" maps to "" which hides
// that section. Unset fields keep the automatic Drupal convention.
export function brandSiteConfig(row: Brand): ResolvedSiteConfig {
  const cf = row.customFeeds ?? {};
  const feed = (value: string | undefined, key: string): string | undefined => {
    if (!value) return undefined;
    if (value === "off") return "";
    return `/api/feed-proxy/${row.slug}/${key}`;
  };

  return {
    name: row.displayName,
    url: row.url,
    image: row.image,
    exclusivesUrl: feed(cf.newsFeedUrl, "news"),
    exclusiveFeed: feed(cf.exclusiveFeedUrl, "exclusive"),
    videosFeed: feed(cf.videosFeedUrl, "videos"),
    ArticlesFeed: feed(cf.topReadFeedUrl, "topread"),
  };
}
