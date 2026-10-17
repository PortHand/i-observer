import type { Metadata } from "next";
import { Suspense } from "react";
import "./get-ioverlay.css";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import JsonLd from "@/components/common/JsonLd";
import { routes } from "@/helper/route";
import { breadcrumbJsonLd, pageMetadata } from "@/helper/seo";
import CheckoutLoader from "./components/CheckoutLoader";
import CheckoutSkeleton from "./components/CheckoutSkeleton";
import Steps from "./components/Steps";

export const metadata: Metadata = pageMetadata({
  title: "Get iOverlay: Plans and Checkout",
  description:
    "Buy iOverlay for macOS (Windows and Linux coming soon). Pick a monthly, yearly or lifetime plan, pay by UPI QR code and get your login by email within 24 hours.",
  path: routes.getIOverlay,
  ownShareImage: true,
});

export default function GetIOverlayView({ searchParams }: PageProps<"/get-ioverlay">) {
  return (
    <>
      <SiteHeader current={routes.getIOverlay} />
      <main>
        <Steps />
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutLoader searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbJsonLd("Get iOverlay", routes.getIOverlay)} />
    </>
  );
}
