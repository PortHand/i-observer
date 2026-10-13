import type { Metadata } from "next";
import "../home/home.css";
import "./get-iobserver.css";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import { routes } from "@/helper/route";
import Steps from "./components/Steps";

export const metadata: Metadata = {
  title: "Get iObserver",
  description: "Pay by UPI, upload the screenshot and get your iObserver login within 24 hours.",
};

export default function GetIObserverView() {
  return (
    <>
      <SiteHeader signedIn={false} current={routes.getIObserver} />
      <main>
        <Steps />
      </main>
      <SiteFooter />
    </>
  );
}
