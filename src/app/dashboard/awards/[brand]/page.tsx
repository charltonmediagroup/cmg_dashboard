import { Suspense } from "react";
import { notFound } from "next/navigation";
import * as brandsRepo from "@/lib/repos/brands";
import { getCache, ttls } from "@/lib/cache";
import { getAwards, type AwardsBrand } from "@/lib/sources/drupalAwards";
import { manualAwards } from "@/lib/sources/manualEvents";
import LoadingPage from "@/components/LoadingPage";
import AwardsGridClient from "../AwardsGridClient";

export const dynamic = "force-dynamic";

async function loadAwardsForBrand(slug: string) {
  const row = await brandsRepo.findBySlug(slug);
  if (!row || !(row.departments ?? []).includes("awards")) return null;
  const sources: AwardsBrand[] = row.url
    ? [{ brand: row.slug, name: row.displayName, url: row.url }]
    : [];
  const scraped = sources.length
    ? await getCache().getOrLoad(
        `awards:list:${slug}`,
        () => getAwards(sources),
        { ttlMs: ttls.AWARDS, staleMs: ttls.AWARDS_STALE },
      )
    : [];
  return [...scraped, ...manualAwards([row])].sort(
    (a, b) => new Date(a.field_date).getTime() - new Date(b.field_date).getTime(),
  );
}

async function AwardsBrandContent({ brand }: { brand: string }) {
  const awards = await loadAwardsForBrand(brand);
  if (awards === null) notFound();
  return <AwardsGridClient awards={awards} />;
}

export default async function AwardsBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: rawBrand } = await params;
  const brand = decodeURIComponent(rawBrand).toLowerCase();
  return (
    <div className="h-[100dvh] max-w-screen overflow-hidden bg-white text-gray-900">
      <Suspense fallback={<LoadingPage loadingText="Loading Awards..." />}>
        <AwardsBrandContent brand={brand} />
      </Suspense>
    </div>
  );
}
