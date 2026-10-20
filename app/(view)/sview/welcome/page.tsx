import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../(pview)/home/components/SiteHeader";
import ShortcutsSection from "../../(pview)/what-is-ioverlay/components/ShortcutsSection";
import HelpBand from "./components/HelpBand";
import HowToUse from "./components/HowToUse";
import VideoGuide from "./components/VideoGuide";
import Welcome from "./components/Welcome";
import WelcomeSkeleton from "./components/WelcomeSkeleton";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false },
};

/**
 * Landing page for any signed-in account: the setup guide for this computer (tabs for macOS and
 * Windows, each with its one-time install steps and the download below them), then how to use the
 * app, its shortcuts and a video guide. Only the top reads the session.
 */
export default function WelcomeView() {
  return (
    <>
      <SiteHeader signedIn current={routes.welcome} />
      <main>
        <section className="band">
          <div className="container">
            <Suspense fallback={<WelcomeSkeleton />}>
              <Welcome />
            </Suspense>
          </div>
        </section>
        <HowToUse />
        <ShortcutsSection />
        <VideoGuide />
        <HelpBand />
      </main>
      <SiteFooter />
    </>
  );
}
