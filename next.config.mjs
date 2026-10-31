/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    // Paylaşılan hosting (CloudLinux LVE) proses limitinə düşməsin: build zamanı
    // worker sayı serverin CPU sayına (63) görə deyil, sabit kiçik dəyərlə seçilir.
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
  },
};

export default nextConfig;
