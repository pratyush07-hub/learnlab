/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'tepysveqbchnyjkeyjnh.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Only apply CSP in production
          ...(process.env.NODE_ENV === 'production' ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
            {
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com;
    style-src 'self' 'unsafe-inline' https://checkout.razorpay.com;
    img-src 'self' data: blob: https: https://*.razorpay.com;
    font-src 'self' data: https://checkout.razorpay.com;
    connect-src 'self' https://hhhmmzhxkwommdgebwna.supabase.co https://tepysveqbchnyjkeyjnh.supabase.co https://api.razorpay.com https://*.razorpay.com;
    frame-src 'self' https://api.razorpay.com https://*.razorpay.com;
    child-src 'self' https://api.razorpay.com;
  `.replace(/\s{2,}/g, ' '), // optional formatting
}

          ] : []),
        ],
      },
    ];
  },

  // Performance optimizations
  experimental: {
    scrollRestoration: true,
  },

  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;