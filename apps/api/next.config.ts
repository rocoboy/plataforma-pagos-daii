import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  env: {
    // Variable de entorno para Swagger
    VERCEL_URL: process.env.VERCEL_URL,
  },
  // Para desarrollo local, crea un archivo .env.local con:
  // VERCEL_URL=localhost:3000
};

export default nextConfig;
