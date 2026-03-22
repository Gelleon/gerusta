import type { NextConfig } from "next";

function resolveBackendUrl(): string {
  const candidates = [
    process.env.SERVER_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.BACKEND_URL,
  ];

  const fromEnv = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:3001";
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const backendUrl = resolveBackendUrl();

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
