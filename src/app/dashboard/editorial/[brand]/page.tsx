import { notFound } from "next/navigation";
import { Suspense } from "react";
import * as brandsRepo from "@/lib/repos/brands";
import LoadingPage from "@/components/LoadingPage";
import EditorialBrandClient from "./EditorialBrandClient";
import { brandSiteConfig } from "@/lib/util/brandSiteConfig";

export const dynamic = "force-dynamic";

export default async function EditorialBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: rawBrand } = await params;
  const brand = decodeURIComponent(rawBrand).toLowerCase();
  const row = await brandsRepo.findBySlug(brand);
  if (!row || !(row.departments ?? []).includes("editorial")) notFound();

  return (
    <Suspense fallback={<LoadingPage loadingText={`Loading ${row.displayName}…`} />}>
      <EditorialBrandClient
        brand={brand}
        siteConfig={brandSiteConfig(row)}
      />
    </Suspense>
  );
}
