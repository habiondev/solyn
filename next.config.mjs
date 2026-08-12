/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coresg-normal.trae.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage: <project_ref>.supabase.co/storage/v1/object/public/<bucket>/...
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
