/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'rxautos.com.br',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 's2-autoesporte.glbimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i.s3.glbimg.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.autopapo.com.br',
      },
      {
        protocol: 'https',
        hostname: 'i.bstr.es',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/static/:path*',
        destination: '/_next/static/:path*'
      }
    ]
  }
}

module.exports = nextConfig