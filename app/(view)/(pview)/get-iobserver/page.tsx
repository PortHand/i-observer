import type { Metadata } from "next";
import "./get-iobserver.css";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import { routes } from "@/helper/route";
import Checkout from "./components/Checkout";
import Steps from "./components/Steps";

export const metadata: Metadata = {
  title: "Get iObserver",
  description:
    "Share your contact details, pay by UPI QR code and send the transaction ID. Your iObserver login arrives by email within 24 hours.",
};

export default function GetIObserverView() {
  return (
    <>
      <SiteHeader signedIn={false} current={routes.getIObserver} />
      <main>
        <Steps />
        <Checkout />
      </main>
      <SiteFooter />
    </>
  );
}
