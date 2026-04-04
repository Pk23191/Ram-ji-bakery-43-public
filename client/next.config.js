/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ram-ji-bakery23.onrender.com", "res.cloudinary.com", "images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ram-ji-bakery23.onrender.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;