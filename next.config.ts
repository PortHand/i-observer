import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  experimental: {
    serverActions: {
      // Payment screenshots (up to 5 MB) go to a Server Action, plus room for the multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
