import { MarketingDashboard } from "@/components/ceo/MarketingDashboard";
import { cacheKeys, getCache, ttls } from "@/lib/cache";
import { formatWeekRange, fromEpochDay, parseCivilDate, today, toEpochDay, weekEnd, weekStart } from "@/lib/ceo/week";
import { CATEGORIES } from "@/lib/ceo-marketing/categories";
import { loadWeeklyMarketing, type WeeklyMarketing } from "@/lib/ceo-marketing/marketing-sheet";

// The reporting week rolls at Singapore midnight, so this page must never be
// statically rendered — it would keep serving last week's numbers.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata = {
  title: "CEO Marketing — CMG Dashboard",
};

/**
 * An explicitly requested week — a `?asOf=` URL override, then `CEO_MARKETING_AS_OF`
 * (a testing freeze). Absent both, this returns null and the page follows the
 * sheet's latest populated week instead. Same shape as the money page.
 */
function explicitAsOf(raw: string | string[] | undefined): { asOf: string; pinned: boolean } | null {
  const now = today();
  const requested =
    parseCivilDate(Array.isArray(raw) ? raw[0] : raw) ?? parseCivilDate(process.env.CEO_MARKETING_AS_OF);
  if (requested === null) return null;

  const asOf = toEpochDay(requested) > toEpochDay(now) ? now : requested;
  return { asOf, pinned: asOf !== now };
}

async function loadThroughCache(cacheDate: string, loader: () => Promise<WeeklyMarketing>): Promise<WeeklyMarketing> {
  const key = cacheKeys.ceoMarketingLeads(cacheDate);
  try {
    return await getCache().getOrLoad<WeeklyMarketing>(key, loader, {
      ttlMs: ttls.CEO_MONEY_LEDGER,
      staleMs: ttls.CEO_MONEY_LEDGER_STALE,
    });
  } catch (err) {
    console.error("[ceo-marketing] cache unavailable, reading through:", err);
    return loader();
  }
}

export default async function CeoMarketingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const explicit = explicitAsOf(params.asOf);
  const now = today();

  // The sheet read scans every block regardless of date, so bucket the cache by
  // the pinned week when pinned, else by today (refreshes daily).
  const cacheDate = explicit?.asOf ?? now;

  if (params.cache === "clear") {
    try {
      await getCache().invalidate(cacheKeys.ceoMarketingLeads(cacheDate));
    } catch (err) {
      console.error("[ceo-marketing] cache invalidate failed:", err);
    }
  }

  // A failed read degrades to empty cards with a warning rather than taking the
  // page down.
  let weekly: WeeklyMarketing = {
    categories: CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      unit: c.unit,
      primary: null,
      cost: null,
      spend: null,
      qualityLeads: null,
      qualityCost: null,
      primaryTarget: c.primaryTarget,
      costTarget: c.costTarget,
      qualityTarget: c.qualityTarget ?? null,
      qualityCostTarget: c.qualityCostTarget ?? null,
    })),
    weekLabel: null,
    weekEnd: null,
    source: "none",
    warnings: [],
  };
  try {
    weekly = await loadThroughCache(cacheDate, () =>
      explicit ? loadWeeklyMarketing(explicit.asOf) : loadWeeklyMarketing(now, { latest: true }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ceo-marketing] sheet unreadable:", err);
    weekly = { ...weekly, warnings: [`Could not read the marketing sheet: ${message}`] };
  }

  // Following the sheet, the header paces to the shown block's Thursday; pinned,
  // it stays on the requested day.
  const asOf = explicit?.asOf ?? weekly.weekEnd ?? now;
  const pinned = explicit?.pinned ?? false;

  // When following the sheet lands on a week other than the current one, say so.
  let weekNote: string | null = null;
  if (!explicit && weekly.weekEnd) {
    const shownFriday = weekStart(toEpochDay(weekly.weekEnd));
    if (shownFriday !== weekStart(toEpochDay(now))) {
      weekNote = `Showing the latest week with data (${
        weekly.weekLabel ??
        formatWeekRange(fromEpochDay(shownFriday), fromEpochDay(weekEnd(toEpochDay(weekly.weekEnd))))
      }), not the current week.`;
    }
  }

  return (
    <MarketingDashboard
      categories={weekly.categories}
      asOf={asOf}
      pinned={pinned}
      live={weekly.source === "sheet"}
      weekLabel={weekly.weekLabel}
      weekNote={weekNote}
      warnings={weekly.warnings}
    />
  );
}
