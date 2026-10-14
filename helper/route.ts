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
  contact: "/contact",
  signIn: "/sign-in",
} as const;

/** API route paths, called through helper/http.ts. Each matches a route.ts under app/api. */
export const apiRoutes = {
  contact: "/api/contact",
} as const;

/** Anchor ids of the home page sections that other pages link to. */
export const homeSections = {
  top: "top",
  platforms: "platforms",
  demo: "demo",
  pricing: "pricing",
} as const;

export type HomeSection = keyof typeof homeSections;

/** Link to a home page section that also works from other pages, e.g. "/#pricing". */
export const homeSection = (section: HomeSection) => `${routes.home}#${homeSections[section]}`;

/** Anchor ids of the Get iObserver page sections that other pages link to. */
export const getIObserverSections = {
  checkout: "checkout",
} as const;

/** Link straight to the checkout form on the Get iObserver page: "/get-iobserver#checkout". */
export const checkoutLink = `${routes.getIObserver}#${getIObserverSections.checkout}`;
