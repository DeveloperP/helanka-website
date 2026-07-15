import { packages as allPackages } from "@/lib/packages";
import { getPackagePriceEstimates } from "@/actions/pricing-actions";
import FeaturedPackages from "./featured-packages";

const FEATURED_SLUGS = [
  "heritage-hill-country-escape",
  "golden-sands-southern-coast",
  "honeymoon-package",
  "wildlife-getaway",
];

export default async function FeaturedPackagesServer() {
  const priceEstimates = await getPackagePriceEstimates();
  const featured = FEATURED_SLUGS
    .map((slug) => allPackages.find((p) => p.slug === slug))
    .filter(Boolean) as (typeof allPackages)[number][];

  const serialized = featured.map((pkg) => ({
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    image: pkg.image,
    durationDays: pkg.durationDays,
    difficulty: pkg.difficulty,
    price: pkg.price,
  }));

  return <FeaturedPackages packages={serialized} priceEstimates={priceEstimates} />;
}
