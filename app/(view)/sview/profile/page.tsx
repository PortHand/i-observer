import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../(pview)/home/components/SiteHeader";
import Profile from "./components/Profile";
import ProfileSkeleton from "./components/ProfileSkeleton";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
};

/** The signed-in customer's account, plan and feedback. Orders are on their own page (../orders). */
export default function ProfileView() {
  return (
    <>
      <SiteHeader signedIn current={routes.profile} />
      <main>
        <section className="band">
          <div className="container">
            <Suspense fallback={<ProfileSkeleton />}>
              <Profile />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
