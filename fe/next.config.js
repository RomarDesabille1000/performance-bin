/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    api: 'http://127.0.0.1:8000/api',
    // api: 'https://performance-bin-production-e657.up.railway.app/api',
    userRole: 'JJpBIePWvMWPHntyWKhw',
  },
}

module.exports = nextConfig
