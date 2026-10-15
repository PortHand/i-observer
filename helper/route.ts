// Page paths and home-page section links, shared by every view.
// Kept outside app/: a route.ts inside app/ would be treated as a Route Handler.
//
// Routes come from the folders in app/(view): (pview) holds public pages, sview pages that need
// sign-in. Parenthesised group names are not part of the URL, so
// app/(view)/(pview)/get-ioverlay/page.tsx is served at /get-ioverlay. sview is a plain folder, so
// it is: app/(view)/sview/welcome/page.tsx is served at /sview/welcome. Keep these paths in sync
// with those folder names.

export const routes = {
  home: "/",
  whatIsIOverlay: "/what-is-ioverlay",
  getIOverlay: "/get-ioverlay",
  contact: "/contact",
  signIn: "/sign-in",
  /** Signed-in pages, in app/(view)/sview. */
  welcome: "/sview/welcome",
  /** Admin dashboard; the order list is below it. */
  admin: "/sview/admin",
  adminOrders: "/sview/admin/orders",
} as const;

/**
 * Every page under this path needs sign-in: the app/(view)/sview folder. proxy.ts sends signed-out
 * visitors to the sign-in page, so a new folder there is protected without listing it anywhere.
 */
export const secureRoot = "/sview";

/** One order in the admin portal: "/sview/admin/orders/IOV-AB12CD". */
export const adminOrderLink = (reference: string) => `${routes.adminOrders}/${encodeURIComponent(reference)}`;

/** Pages only admins may open. Other signed-in users are sent to their home route. */
export const adminRoutes: readonly string[] = [routes.admin];

/** Where a role lands after signing in. */
export const homeRouteFor = (role: "customer" | "admin") => (role === "admin" ? routes.admin : routes.welcome);

/** True when `pathname` is one of `list`, or a page below one. */
export const isUnder = (pathname: string, list: readonly string[]) =>
  list.some((route) => pathname === route || pathname.startsWith(`${route}/`));

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

/** Query parameter that pre-selects a plan at checkout. */
export const checkoutPlanParam = "plan";

/** The checkout with this plan already chosen: "/get-ioverlay?plan=yearly#checkout". */
export const checkoutPlanLink = (planId: string) =>
  `${routes.getIOverlay}?${checkoutPlanParam}=${encodeURIComponent(planId)}#${getIOverlaySections.checkout}`;
