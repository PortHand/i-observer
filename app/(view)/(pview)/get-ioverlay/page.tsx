import type { Metadata } from "next";
import "./get-ioverlay.css";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import { routes } from "@/helper/route";
import Checkout from "./components/Checkout";
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
        <Checkout />
      </main>
      <SiteFooter />
    </>
  );
}
