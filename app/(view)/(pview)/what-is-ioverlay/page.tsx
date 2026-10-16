import type { Metadata } from "next";
import "./what-is-ioverlay.css";
import JsonLd from "@/components/common/JsonLd";
import { routes } from "@/helper/route";
import { breadcrumbJsonLd, pageMetadata } from "@/helper/seo";
import SiteFooter from "../home/components/SiteFooter";
import Closing from "../home/components/Closing";
import SiteHeader from "../home/components/SiteHeader";
import Hiding from "./components/Hiding";
import Inside from "./components/Inside";
import Intro from "./components/Intro";
import ShortcutsSection from "./components/ShortcutsSection";
import UseCases from "./components/UseCases";
import { closing } from "./content/whatIsContent";

export const metadata: Metadata = pageMetadata({
  title: "What is iOverlay? How the Hidden Overlay Works",
  description:
    "iOverlay is a desktop overlay with a built-in browser that stays on your screen but out of Zoom, Meet and Teams shares, recordings and screenshots. See how it works.",
  path: routes.whatIsIOverlay,
  ownShareImage: true,
});

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
      <JsonLd data={breadcrumbJsonLd("What is iOverlay?", routes.whatIsIOverlay)} />
    </>
  );
}
