import type { Metadata } from "next";
import { Suspense } from "react";
import "./get-ioverlay.css";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import JsonLd from "@/components/common/JsonLd";
import { routes } from "@/helper/route";
import { breadcrumbJsonLd, pageMetadata } from "@/helper/seo";
import { checkout } from "./content/getContent";
import CheckoutLoader, { CheckoutNotice } from "./components/CheckoutLoader";
import Steps from "./components/Steps";

export const metadata: Metadata = pageMetadata({
  title: "Get iOverlay: Plans and Checkout",
  description:
    "Buy iOverlay for Windows, macOS or Linux. Pick a monthly, yearly or lifetime plan, pay by UPI QR code and get your login by email within 24 hours.",
  path: routes.getIOverlay,
  ownShareImage: true,
});

export default function GetIOverlayView({ searchParams }: PageProps<"/get-ioverlay">) {
  return (
    <>
      <SiteHeader current={routes.getIOverlay} />
      <main>
        <Steps />
        <Suspense fallback={<CheckoutNotice>{checkout.loading}</CheckoutNotice>}>
          <CheckoutLoader searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbJsonLd("Get iOverlay", routes.getIOverlay)} />
    </>
  );
}
