/** @type {import('next').NextConfig} */
// Built as a static site for Cloudflare Pages. The server-side pieces
// (EVE SSO token exchange/refresh/revoke and price appraisal) live in
// /functions/api as Cloudflare Pages Functions.
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
