import type { Metadata } from "next";
import "../home/home.css";
import "./what-is-iobserver.css";
import { routes } from "@/helper/route";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import Closing from "./components/Closing";
import Hiding from "./components/Hiding";
import Inside from "./components/Inside";
import Intro from "./components/Intro";
import UseCases from "./components/UseCases";

export const metadata: Metadata = {
  title: "What is iObserver?",
  description: "A desktop overlay that stays on your screen and out of screen shares, recordings and screenshots.",
};

export default function WhatIsView() {
  return (
    <>
      <SiteHeader signedIn={false} current={routes.whatIsIObserver} />
      <main>
        <Intro />
        <Inside />
        <Hiding />
        <UseCases />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
