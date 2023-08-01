/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/shopping',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
