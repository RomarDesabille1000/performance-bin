/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // api: 'http://127.0.0.1:8000/api',
    api: 'https://project-production-a18e.up.railway.app/api',
  },
}

module.exports = nextConfig
