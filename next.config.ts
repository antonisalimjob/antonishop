import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/shop",
  async redirects() {
    return [{ source: "/", destination: "/shop", permanent: false, basePath: false }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
