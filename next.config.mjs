/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/dashboard.html',
        destination: '/admin/dashboard',
      },
      {
        source: '/account.html',
        destination: '/account',
      },
      {
        source: '/projects.html',
        destination: '/projects',
      },
      {
        source: '/community.html',
        destination: '/community',
      },
      {
        source: '/board.html',
        destination: '/board',
      },
      {
        source: '/modules.html',
        destination: '/projects/duet/modules',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
