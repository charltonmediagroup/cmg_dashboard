import type { Slug, Timestamped } from "./common";

export interface Ga4Filter {
  fieldName: string;
  matchType: string;
  value: string;
}

// Overrides for the four XML feeds a brand page consumes. Unset fields fall
// back to the Drupal convention ({url}/news-feed.xml etc). The literal value
// "off" hides that section entirely (for sites that have no such feed).
export interface BrandCustomFeeds {
  newsFeedUrl?: string; // bottom scrolling ticker
  exclusiveFeedUrl?: string; // rotating ticker card
  videosFeedUrl?: string; // video rotator
  topReadFeedUrl?: string; // "top views" article list
}

// A hand-entered awards/BizzCon event for brands whose site can't be scraped
// (non-Drupal). Shown in the department grids alongside scraped events.
export interface ManualEvent {
  department: "awards" | "bizzcon";
  title: string;
  date: string; // YYYY-MM-DD
  city?: string;
  link?: string;
  image?: string;
  // Submission/nomination details (awards only — drives the "nominations
  // close in N days" countdown and contact column in the awards grid).
  submissionStart?: string; // YYYY-MM-DD
  submissionEnd?: string; // YYYY-MM-DD
  contactPerson?: string;
}

export interface Brand extends Timestamped {
  slug: Slug;
  displayName: string;
  url?: string;
  color?: string;
  secondaryColor?: string;
  image?: string;
  ga4PropertyId?: string;
  ga4Filter?: Ga4Filter;
  drupalDomain?: string;
  customFeeds?: BrandCustomFeeds;
  manualEvents?: ManualEvent[];
  awardsShowcaseId?: string;
  group?: string;
  departments: Slug[];
  active: boolean;
}
