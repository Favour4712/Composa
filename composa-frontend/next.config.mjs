/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
  webpack: (config) => {
    const externals = config.externals ?? [];
    config.externals = Array.isArray(externals)
      ? [...externals, "pino-pretty", "lokijs", "encoding"]
      : externals;
    return config;
  },
};

export default nextConfig;
