import type { Metadata } from "next";
import { Suspense } from "react";
import "./get-ioverlay.css";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import { routes } from "@/helper/route";
import { checkout } from "./content/getContent";
import CheckoutLoader, { CheckoutNotice } from "./components/CheckoutLoader";
import Steps from "./components/Steps";

export const metadata: Metadata = {
  title: "Get iOverlay",
  description:
    "Share your contact details, pay by UPI QR code and send the transaction ID. Your iOverlay login arrives by email within 24 hours.",
};

export default function GetIOverlayView() {
  return (
    <>
      <SiteHeader signedIn={false} current={routes.getIOverlay} />
      <main>
        <Steps />
        <Suspense fallback={<CheckoutNotice>{checkout.loading}</CheckoutNotice>}>
          <CheckoutLoader />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
