import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/_trac/script.js", destination: "https://go.akyra.io/trac.js" },
      { source: "/_trac/api/:path*", destination: "https://go.akyra.io/api/:path*" },
    ];
  },
};

export default nextConfig;
