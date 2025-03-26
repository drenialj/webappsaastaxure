/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnung: Dies ist nur für Testzwecke!
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig; 