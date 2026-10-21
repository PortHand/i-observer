import type { Metadata } from "next";
import { pageMetadata } from "@/helper/seo";
import LandingView from "../_landing/components/LandingView";
import { landingPages } from "../_landing/content/landingContent";

const page = landingPages.invisibleOverlay;

export const metadata: Metadata = pageMetadata({ ...page.seo, path: page.path, ownShareImage: true });

export default function Page() {
  return <LandingView page={page} />;
}
