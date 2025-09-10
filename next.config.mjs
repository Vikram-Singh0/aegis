// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for faster builds
  experimental: {
    // optimizePackageImports: ['lucide-react', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-switch'],
  },

  // Optimize webpack for faster compilation
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster development builds - disable heavy optimizations
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    return config;
  },

  // // Enable SWC minification for faster builds
  // swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;