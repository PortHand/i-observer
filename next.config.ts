import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  async headers() {
    return [
      // API responses aren't pages: keep them out of search results.
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  experimental: {
    serverActions: {
      // Payment screenshots (up to 5 MB) go to a Server Action, plus room for the multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
