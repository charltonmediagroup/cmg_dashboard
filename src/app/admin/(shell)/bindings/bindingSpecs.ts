/**
 * What each binding is for, who reads it, and the sheet layout it expects.
 *
 * Written from the code that actually consumes each binding, so it stays a
 * description of the app rather than a wish list. When a purpose is declared
 * but nothing reads it yet, that is stated instead of quietly implied.
 */

export interface ColumnSpec {
  /** Spreadsheet column letter, where the layout is positional. */
  column?: string;
  name: string;
  note?: string;
}

export interface LayoutSpec {
  /** Named worksheet tabs this binding reads. */
  tabs?: string[];
  /** Positional columns, for sheets read by column rather than header. */
  columns?: ColumnSpec[];
  /** Anything the columns table can't express. */
  notes?: string[];
}

export interface BindingSpec {
  label: string;
  /** One line: what breaks if this binding is wrong. */
  summary: string;
  /** Where in the app the data ends up. */
  usedBy: string[];
  /** Source files that read it, for a developer following up. */
  readBy: string[];
  /** Null when nothing reads this purpose yet. */
  layout: LayoutSpec | null;
  /** Set when the purpose exists but no code consumes it. */
  unused?: string;
}

const AWARDS_LEADERBOARD: LayoutSpec = {
  notes: [
    "First row is treated as headers; every row after it is one deal.",
    "A row is skipped unless it has an award name, a person, and an amount above zero.",
    "The person is matched to a staff record through their name keys, so spelling variants still count.",
  ],
  columns: [
    { column: "A", name: "Award / event name" },
    { column: "B", name: "Person in charge", note: "\"c/o\" prefixes, bracketed notes and trailing tags are stripped" },
    { column: "E", name: "Amount (USD)", note: "$ and thousands separators are tolerated" },
  ],
};

const INVOICE_REGISTER: LayoutSpec = {
  tabs: ["SG Accounts", "HK Accounts", "ME Accounts"],
  notes: [
    "One tab per region; the region a page shows decides which tab is read.",
    "Hong Kong uses its own column positions — see the second set below.",
    "Dates must be real date cells, not text, so June and December can't be confused.",
    "Status is read as PAID / UNPAID / CANCELLED / CREDIT NOTE; anything else is counted as other.",
    "Cash received is the bank figure and sits a little under the gross amount, because transfers cost a few dollars.",
  ],
  columns: [
    { column: "A", name: "Issue date", note: "a dated cell is what makes the row an invoice" },
    { column: "C", name: "Company" },
    { column: "F", name: "Award / event" },
    { column: "G", name: "Currency", note: "HK: column H" },
    { column: "K", name: "Gross amount", note: "HK: column I" },
    { column: "L", name: "Status", note: "HK: column J" },
    { column: "S", name: "Payment date", note: "HK: column K — blank until paid" },
    { column: "U", name: "Cash received", note: "HK: column P — filled only on PAID rows" },
  ],
};

const MARKETING_WEEKLY: LayoutSpec = {
  tabs: ["Weekly Overall Report"],
  notes: [
    "A stack of Friday–Thursday weekly blocks, read across columns A to BO.",
    "Each block opens with a date header in column B, e.g. \"Jun 26 - Jul 2, 2026\". The year is stated once, on the end date.",
    "Inside a block, four sections sit side by side — Awards, Bizcon, Sales, Awards.info — each with its labels in its own column and values in the column beside them.",
    "The page shows the most recent block that has started and actually carries figures, so a not-yet-filled current week is skipped.",
  ],
  columns: [
    { name: "Weekly Total Leads", note: "Sales uses \"Weekly Total Clicks\" instead" },
    { name: "Weekly Total Spent" },
    { name: "CPL", note: "the first one below the leads total; rows above it are per-platform rates" },
    { name: "Weekly Total Quality Leads", note: "Awards.info only" },
    { name: "CPL of Quality Leads", note: "Awards.info only" },
  ],
};

const CEO_LEDGER: LayoutSpec = {
  tabs: ["Invoices", "Payments", "Targets", "Config"],
  notes: [
    "All four tabs are read in one request, columns A to Z each.",
    "The Config tab can override the dashboard's thresholds and budget rates.",
  ],
};

export const BINDING_SPECS: Record<string, BindingSpec> = {
  leaderboard: {
    label: "Leaderboard",
    summary: "Sales figures behind a department's leaderboard screen.",
    usedBy: ["Awards / Bizzcon / Editorial leaderboard pages", "The rotating leaderboard on wall displays"],
    readBy: ["src/app/api/leaderboard/[department]/route.ts", "src/app/api/leaderboard/bizzcon/route.ts"],
    layout: AWARDS_LEADERBOARD,
  },
  ceo_invoice_register: {
    label: "CEO · Invoice register",
    summary: "Every invoice behind the CEO money dashboards — revenue, cash collected and overdue receivables.",
    usedBy: ["CEO → Money (All Regions)", "CEO → Money → Singapore / Hong Kong / Middle East", "CEO → Money → Awards"],
    readBy: ["src/lib/ceo-money/invoice-register.ts"],
    layout: INVOICE_REGISTER,
  },
  ceo_marketing: {
    label: "CEO · Marketing sheet",
    summary: "Weekly campaign leads, spend and cost-per-lead for the CEO marketing dashboard.",
    usedBy: ["CEO → Marketing"],
    readBy: ["src/lib/ceo-marketing/marketing-sheet.ts"],
    layout: MARKETING_WEEKLY,
  },
  ceo_money: {
    label: "CEO · Money sheet",
    summary: "The older four-tab ledger format.",
    usedBy: [],
    readBy: ["src/lib/ceo-money/sheets.ts"],
    layout: CEO_LEDGER,
    unused:
      "No page reads this today — the CEO money dashboards run off the invoice register instead. Safe to leave unset.",
  },
  sponsorship: {
    label: "Sponsorship",
    summary: "Reserved for sponsorship figures.",
    usedBy: [],
    readBy: [],
    layout: null,
    unused:
      "No page reads this yet, so setting it has no effect on the dashboards.",
  },
  analytics: {
    label: "Analytics",
    summary: "Reserved for analytics sources.",
    usedBy: [],
    readBy: [],
    layout: null,
    unused:
      "No page reads this. Live visitor numbers come from the GA4 property id on each publication, not from here. Deleting the row changes nothing on the dashboards.",
  },
  content: {
    label: "Content",
    summary: "Reserved for article and content feeds.",
    usedBy: [],
    readBy: [],
    layout: null,
    unused:
      "No page reads this. Articles come from each publication's Drupal domain, or from its custom feed URLs when set. Deleting the row changes nothing on the dashboards.",
  },
  media: {
    label: "Media",
    summary: "Reserved for video and media sources.",
    usedBy: [],
    readBy: [],
    layout: null,
    unused:
      "No page reads this. Videos are pulled from Vimeo without a tag filter, so the tag below only affects what the Test button samples.",
  },
};

/** Config fields each source kind understands. */
export const KIND_CONFIG: Record<string, { field: string; required?: boolean; note: string }[]> = {
  google_sheets: [
    { field: "spreadsheetId", required: true, note: "The long code in the sheet's URL, between /d/ and /edit." },
    { field: "sheetName", note: "Worksheet tab name. Leave empty to use the binding's own default tabs." },
    { field: "gid", note: "Numeric tab id from the URL after #gid=. Only used for the Open sheet link." },
    { field: "range", note: "A1 range such as A1:Z2000. Leave empty to read the default range." },
  ],
  vimeo: [{ field: "tag", note: "Only videos carrying this Vimeo tag are pulled in." }],
  ga4: [
    {
      field: "(none)",
      note: "GA4 property ids live on each publication, not here. This binding only confirms the credentials load.",
    },
  ],
  drupal_jsonapi: [
    { field: "(none)", note: "The domain comes from each publication's Drupal domain field at fetch time." },
  ],
  mongodb: [{ field: "(none)", note: "Uses the app's own database connection." }],
};

export function specFor(purpose: string): BindingSpec | null {
  return BINDING_SPECS[purpose] ?? null;
}
