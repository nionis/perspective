import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/og": ["./src/app/api/og/IBMPlexMono-Regular.ttf"],
  },
  async redirects() {
    return [{ source: "/donate", destination: "/support", permanent: false }];
  },
};

export default nextConfig;
