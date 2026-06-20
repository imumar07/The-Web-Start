/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  transpilePackages: ["lenis"],

  serverExternalPackages: ["@libsql/client", "bcryptjs", "@react-pdf/renderer", "razorpay"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.thewebstart.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "recharts"],
  },

  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
