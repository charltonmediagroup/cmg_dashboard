/**
 * The four campaign categories, each a side-by-side section of the "Weekly
 * Overall Report" tab.
 *
 * Every weekly block repeats the same four sections at the same columns —
 * verified stable across several weeks — each with its own label column and its
 * totals in the column beside it. They do not all track the same thing: Awards,
 * Bizcon and Awards.info count leads and cost per lead, while Sales only counts
 * clicks and spend, so its cards report clicks and cost per click instead.
 */

export type CategoryUnit = "leads" | "clicks";

export interface CategoryConfig {
  key: string;
  label: string;
  /** Zero-based column holding this section's row labels; values sit one to the right. */
  labelColumn: number;
  /** What the primary card counts. */
  unit: CategoryUnit;
  /** True when the sheet also tracks a stricter "quality leads" figure. */
  hasQualityLeads: boolean;
  /**
   * INVENTED placeholders, set near the recent actuals so the bullets land in a
   * readable band. Nobody has agreed them — replace with real targets.
   */
  primaryTarget: number;
  costTarget: number;
  /** Targets for the quality-lead cards, where the category has them. Also invented. */
  qualityTarget?: number;
  qualityCostTarget?: number;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: "awards",
    label: "Awards",
    labelColumn: 0, // A
    unit: "leads",
    hasQualityLeads: false,
    primaryTarget: 120,
    costTarget: 40,
  },
  {
    key: "bizcon",
    label: "Bizcon",
    labelColumn: 31, // AF
    unit: "leads",
    hasQualityLeads: false,
    primaryTarget: 10,
    costTarget: 60,
  },
  {
    key: "sales",
    label: "Sales",
    labelColumn: 52, // BA
    unit: "clicks",
    hasQualityLeads: false,
    primaryTarget: 50,
    costTarget: 15,
  },
  {
    key: "awards-info",
    label: "Awards.info",
    labelColumn: 64, // BM
    unit: "leads",
    hasQualityLeads: true,
    primaryTarget: 25,
    costTarget: 50,
    qualityTarget: 5,
    qualityCostTarget: 300,
  },
];
