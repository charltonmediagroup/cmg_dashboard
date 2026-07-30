import type { ColumnMap } from "./invoice-register";

/**
 * The regional invoice registers, each a tab in the one accounts workbook, and
 * each now its own dashboard page (SG / HK / ME).
 *
 * The tabs do not share a column layout. SG and ME line up; HK is shifted —
 * currency, gross, status, payment date and cash all sit two-to-five columns to
 * the left of where SG keeps them. These maps were read off the actual data
 * rows, not the header, because HK's header row is itself misaligned from its
 * data. Changing them means re-probing the sheet.
 */

/** SG Accounts and ME Accounts: A / C / F / G / K / L / S / U. */
const STANDARD_COLUMNS: ColumnMap = {
  issued: 0, // A
  company: 2, // C
  award: 5, // F
  currency: 6, // G
  gross: 10, // K
  status: 11, // L
  paidOn: 18, // S
  cash: 20, // U
};

/** HK Accounts: A / C / F / H / I / J / K / P. */
const HK_COLUMNS: ColumnMap = {
  issued: 0, // A
  company: 2, // C
  award: 5, // F
  currency: 7, // H
  gross: 8, // I
  status: 9, // J
  paidOn: 10, // K
  cash: 15, // P
};

export interface Region {
  key: string;
  /** Shown above the region's cards and in the account nav. */
  label: string;
  /** The worksheet tab it reads from. */
  tab: string;
  columns: ColumnMap;
  /**
   * Weekly revenue target, in SGD. INVENTED placeholders, scaled to each
   * region's rough billing volume so the bullet lands in a readable band —
   * nobody has agreed them. SG bills the most, HK less, ME least.
   */
  revenueTarget: number;
  /**
   * The ceiling the overdue-receivables balance should stay under, in SGD, drawn
   * as the target line on the YTD chart. Also INVENTED — set a little below where
   * each region's balance has typically sat, as a stretch, until a real one is
   * agreed. Scaled to the region like the revenue target.
   */
  overdueTarget: number;
}

export const REGIONS: Region[] = [
  {
    key: "sg",
    label: "Singapore",
    tab: "SG Accounts",
    columns: STANDARD_COLUMNS,
    revenueTarget: 1_000_000,
    overdueTarget: 800_000,
  },
  {
    key: "hk",
    label: "Hong Kong",
    tab: "HK Accounts",
    columns: HK_COLUMNS,
    revenueTarget: 400_000,
    overdueTarget: 320_000,
  },
  {
    key: "me",
    label: "Middle East",
    tab: "ME Accounts",
    columns: STANDARD_COLUMNS,
    revenueTarget: 150_000,
    overdueTarget: 120_000,
  },
];

/** The region for an account key (`sg` / `hk` / `me`), or undefined if unknown. */
export function getRegion(key: string): Region | undefined {
  return REGIONS.find((r) => r.key === key);
}
