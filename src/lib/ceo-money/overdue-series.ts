import { fromEpochDay, toEpochDay, type CivilDate, type EpochDay } from "@/lib/ceo/week";
import type { InvoiceRegister, RegisterRow } from "./invoice-register";

/**
 * The overdue-receivables balance tracked across the year — the data behind the
 * YTD chart.
 *
 * Because every invoice in the register carries both its issue date and (when
 * settled) its payment date, the balance can be reconstructed as of any past
 * day: an invoice is overdue on day D if it was issued this year, is more than
 * 30 days old on D, and had not been paid on or before D. The current year's
 * line runs to the day being viewed ("as of now"); the prior year's runs its
 * full length as an overlay.
 */

const OVERDUE_AFTER_DAYS = 30;

/** Cancelled and credit-noted rows were never a real receivable. */
const EXCLUDED = new Set(["VOID", "CREDIT_NOTE"]);

export interface OverduePoint {
  /** Position through the year, 0 (Jan 1) to 1 (Dec 31), so two years align. */
  frac: number;
  /** The month this point sits in, 1–12, for axis labelling. */
  month: number;
  /** SGD overdue on that day. */
  value: number;
}

export interface OverdueSeries {
  /** Overdue balance as of the viewed day. */
  current: number;
  /** The invented ceiling drawn as the target line. */
  target: number;
  /** Jan → the viewed day, this year. */
  thisYear: OverduePoint[];
  /** Jan → Dec, the prior year. */
  priorYear: OverduePoint[];
  thisYearLabel: string;
  priorYearLabel: string;
}

/** SGD overdue on day `asOf`, among invoices issued in `year`. */
function overdueAt(rows: RegisterRow[], asOf: EpochDay, year: number): number {
  const yearStart = toEpochDay(`${year}-01-01`);
  const yearEnd = toEpochDay(`${year}-12-31`);

  let total = 0;
  for (const row of rows) {
    if (EXCLUDED.has(row.status)) continue;
    if (row.day < yearStart || row.day > yearEnd) continue;
    if (row.day > asOf - OVERDUE_AFTER_DAYS) continue; // not yet 30 days old
    if (row.paidOn !== null && row.paidOn <= asOf) continue; // already paid by then
    total += row.sgd;
  }
  return total;
}

function yearFraction(day: EpochDay, year: number): number {
  const start = toEpochDay(`${year}-01-01`);
  const end = toEpochDay(`${year}-12-31`);
  return (day - start) / (end - start);
}

/** The last calendar day of each month up to and including `throughMonth`. */
function monthEnds(year: number, throughMonth: number): Array<{ day: EpochDay; month: number }> {
  const ends: Array<{ day: EpochDay; month: number }> = [];
  for (let m = 1; m <= throughMonth; m++) {
    const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
    ends.push({ day: toEpochDay(`${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`), month: m });
  }
  return ends;
}

export function buildOverdueSeries(
  register: InvoiceRegister,
  asOfDate: CivilDate,
  target: number,
): OverdueSeries {
  const asOf = toEpochDay(asOfDate);
  const year = Number(asOfDate.slice(0, 4));
  const priorYear = year - 1;
  const asOfMonth = Number(asOfDate.slice(5, 7));
  const asOfDay = Number(asOfDate.slice(8, 10));

  const point = (day: EpochDay, month: number, y: number): OverduePoint => ({
    frac: yearFraction(day, y),
    month,
    value: overdueAt(register.rows, day, y),
  });

  // This year: month-ends of every completed month, then a final point at the
  // viewed day — unless that day *is* a month-end, in which case it is already
  // the last point and would double up.
  const completedMonths = asOfDay >= new Date(Date.UTC(year, asOfMonth, 0)).getUTCDate() ? asOfMonth : asOfMonth - 1;
  const thisYear = monthEnds(year, completedMonths).map((e) => point(e.day, e.month, year));
  if (completedMonths < asOfMonth) {
    thisYear.push(point(asOf, asOfMonth, year));
  }

  const prior = monthEnds(priorYear, 12).map((e) => point(e.day, e.month, priorYear));

  return {
    current: overdueAt(register.rows, asOf, year),
    target,
    thisYear,
    priorYear: prior,
    thisYearLabel: String(year),
    priorYearLabel: String(priorYear),
  };
}
