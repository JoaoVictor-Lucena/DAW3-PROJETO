import type { NextConfig } from "next";

/**
 * Endereço do back-end para o proxy de /api. No `npm run dev` é o localhost; na imagem Docker
 * o build recebe BACKEND_URL=http://backend:8080 (nome do serviço no docker compose).
 * Os rewrites são fixados no build, então mudar a variável exige gerar a imagem de novo.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Gera um servidor Node enxuto em .next/standalone, usado pela imagem Docker.
  output: "standalone",
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
