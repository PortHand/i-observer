// Page paths and home-page section links, shared by every view.
// Kept outside app/: a route.ts inside app/ would be treated as a Route Handler.
//
// Routes come from the folders in app/(view): (pview) holds public pages, (sview) pages that need
// sign-in. The parenthesised group names are not part of the URL, so
// app/(view)/(pview)/get-iobserver/page.tsx is served at /get-iobserver. Keep these paths in sync
// with those folder names.

export const routes = {
  home: "/",
  whatIsIObserver: "/what-is-iobserver",
  getIObserver: "/get-iobserver",
} as const;

/** Anchor ids of the home page sections. */
export const homeSections = {
  top: "top",
  features: "features",
  platforms: "platforms",
  demo: "demo",
  pricing: "pricing",
  shortcuts: "shortcuts-section",
} as const;

export type HomeSection = keyof typeof homeSections;

/** Link to a home page section that also works from other pages, e.g. "/#pricing". */
export const homeSection = (section: HomeSection) => `${routes.home}#${homeSections[section]}`;
