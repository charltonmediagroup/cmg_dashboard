import { redirect } from "next/navigation";

// Money is now one page per account (SG / HK / ME). The bare /money URL lands on
// Singapore, carrying any ?asOf= week-pin through with it.
export const dynamic = "force-dynamic";

export default async function CeoMoneyIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const asOfQuery = typeof params.asOf === "string" ? `?asOf=${encodeURIComponent(params.asOf)}` : "";
  redirect(`/dashboard/ceo/money/sg${asOfQuery}`);
}
