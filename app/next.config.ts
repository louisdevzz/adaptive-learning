import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
      {
        protocol: "https",
        hostname: "pub-5d2d954d54744e9787cc2424c0ec6692.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
