"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import styles from "./ceo-dashboard.module.css";

/**
 * Refetches on the server. Holds the current render rather than flashing a
 * skeleton. `className` overrides the default masthead pill styling — used to
 * match the dashboard-controls overlay when it lives there instead.
 */
export function RefreshButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className ?? styles.refresh}
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
    >
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
