import type { Metadata } from "next";
import "./what-is-ioverlay.css";
import { routes } from "@/helper/route";
import SiteFooter from "../home/components/SiteFooter";
import Closing from "../home/components/Closing";
import SiteHeader from "../home/components/SiteHeader";
import Hiding from "./components/Hiding";
import Inside from "./components/Inside";
import Intro from "./components/Intro";
import ShortcutsSection from "./components/ShortcutsSection";
import UseCases from "./components/UseCases";
import { closing } from "./content/whatIsContent";

export const metadata: Metadata = {
  title: "What is iOverlay?",
  description: "A desktop overlay that stays on your screen and out of screen shares, recordings and screenshots.",
};

export default function WhatIsView() {
  return (
    <>
      <SiteHeader current={routes.whatIsIOverlay} />
      <main>
        <Intro />
        <Inside />
        <Hiding />
        <ShortcutsSection />
        <UseCases />
        <Closing {...closing} />
      </main>
      <SiteFooter />
    </>
  );
}
