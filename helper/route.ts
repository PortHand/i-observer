// Page paths and home-page section links, shared by every view.
// Kept outside app/: a route.ts inside app/ would be treated as a Route Handler.
//
// Routes come from the folders in app/(view): (pview) holds public pages, (sview) pages that need
// sign-in. The parenthesised group names are not part of the URL, so
// app/(view)/(pview)/get-ioverlay/page.tsx is served at /get-ioverlay. Keep these paths in sync
// with those folder names.

export const routes = {
  home: "/",
  whatIsIOverlay: "/what-is-ioverlay",
  getIOverlay: "/get-ioverlay",
  contact: "/contact",
  signIn: "/sign-in",
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

/** Anchor ids of the Get iOverlay page sections that other pages link to. */
export const getIOverlaySections = {
  checkout: "checkout",
} as const;

/** Link straight to the checkout form on the Get iOverlay page: "/get-ioverlay#checkout". */
export const checkoutLink = `${routes.getIOverlay}#${getIOverlaySections.checkout}`;
