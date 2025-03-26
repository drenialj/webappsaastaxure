/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnung: Dies ist nur für Testzwecke!
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig; 