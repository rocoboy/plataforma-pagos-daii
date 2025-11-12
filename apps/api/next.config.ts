import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Optimizar para API
  output: 'standalone',
  env: {
    // Variable de entorno personalizada para Swagger
    API_BASE_URL: process.env.API_BASE_URL,
  },
  transpilePackages: ['@plataforma/types'],
  // Para desarrollo local, crea un archivo .env.local con:
  // API_BASE_URL=http://localhost:3000
  // Experimental: Ensure proper fetch handling for external APIs
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
