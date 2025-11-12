/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  poweredByHeader: false,
  swcMinify: false,
  async redirects(){
    return [
      { source: '/investing', destination: '/category/investing', permanent: true },
      { source: '/economics', destination: '/category/economics', permanent: true },
      { source: '/tax', destination: '/category/tax', permanent: true },
    ];
  }
};
