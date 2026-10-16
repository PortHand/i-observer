import { connection } from "next/server";
import JsonLd from "@/components/common/JsonLd";
import { softwareJsonLd } from "@/helper/seo";
import { getPlansOrNone } from "@/server/features/pricing/module/pricingModule";

/** The app as structured data for search engines, with the plans on sale. Render inside <Suspense>. */
export default async function SoftwareJsonLd() {
  // Prices come from the database, so read them per request (cached a minute), never at build time.
  await connection();
  const plans = await getPlansOrNone();
  return <JsonLd data={softwareJsonLd(plans)} />;
}
