import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Desactivar el frontend, solo servir API
  output: 'standalone',
  experimental: {
    // Solo generar rutas de API
    appDir: true,
  },
  env: {
    // Variable de entorno personalizada para Swagger
    API_BASE_URL: process.env.API_BASE_URL,
  },
  // Para desarrollo local, crea un archivo .env.local con:
  // API_BASE_URL=http://localhost:3000
};

export default nextConfig;
