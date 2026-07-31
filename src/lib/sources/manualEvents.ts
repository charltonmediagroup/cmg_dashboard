import type { Brand } from "@/lib/entities";
import type { Award } from "./drupalAwards";
import type { BizzconEvent } from "./drupalEvents";

// Converts hand-entered events (Brand.manualEvents, set in /admin/brands for
// non-Drupal publications) into the shapes the awards/BizzCon grids consume.

export function manualAwards(rows: Brand[]): Award[] {
  const out: Award[] = [];
  for (const row of rows) {
    for (const [i, ev] of (row.manualEvents ?? []).entries()) {
      if (ev.department !== "awards" || !ev.title || !ev.date) continue;
      out.push({
        id: `manual-${row.slug}-awards-${i}`,
        brand: row.slug,
        title: ev.title,
        field_date: ev.date,
        view_node: ev.link || row.url || "",
        startDate: null,
        endDate: null,
        image: ev.image || undefined,
        city: ev.city || null,
        contactPerson: null,
      });
    }
  }
  return out;
}

export function manualBizzconEvents(rows: Brand[]): BizzconEvent[] {
  const out: BizzconEvent[] = [];
  for (const row of rows) {
    for (const [i, ev] of (row.manualEvents ?? []).entries()) {
      if (ev.department !== "bizzcon" || !ev.title || !ev.date) continue;
      out.push({
        id: `manual-${row.slug}-bizzcon-${i}`,
        brand: row.slug,
        title: ev.title,
        eventDate: ev.date,
        link: ev.link || row.url || "",
        image: ev.image || row.image,
        city: ev.city || null,
        venue: null,
        registrationUrl: ev.link || null,
      });
    }
  }
  return out;
}
