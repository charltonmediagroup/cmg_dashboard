import { NextRequest, NextResponse } from "next/server";
import * as brandsRepo from "@/lib/repos/brands";
import type { BrandCustomFeeds } from "@/lib/entities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-side fetch for a brand's custom feed. External (non-Drupal) sites
// don't send CORS headers, so the browser can't load their XML directly;
// the URL is resolved from the brand record here — never from the client —
// so this can't be used as an open proxy.
const FEED_KEYS: Record<string, keyof BrandCustomFeeds> = {
  news: "newsFeedUrl",
  exclusive: "exclusiveFeedUrl",
  videos: "videosFeedUrl",
  topread: "topReadFeedUrl",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brand: string; feed: string }> },
) {
  const { brand: rawBrand, feed } = await params;
  const key = FEED_KEYS[feed];
  if (!key) return NextResponse.json({ error: "Unknown feed" }, { status: 404 });

  const brand = await brandsRepo.findBySlug(decodeURIComponent(rawBrand).toLowerCase());
  const url = brand?.customFeeds?.[key];
  if (!url || url === "off" || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "No custom feed configured" }, { status: 404 });
  }

  try {
    const upstream = await fetch(url, {
      cache: "no-store",
      headers: { "user-agent": "CMG-Dashboard feed proxy" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream responded ${upstream.status}` },
        { status: 502 },
      );
    }
    const body = await upstream.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/xml; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }
}
