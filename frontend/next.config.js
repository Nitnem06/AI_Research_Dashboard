/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://ai-research-dashboard-8of2.onrender.com/",
  },
};

module.exports = nextConfig;