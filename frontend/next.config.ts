import type { NextConfig } from "next";

function normalizeHttpUrl(rawValue: string): string | null {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `http://${trimmedValue}`;

  try {
    const parsedUrl = new URL(withProtocol);
    return parsedUrl.origin.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function resolveBackendUrl(): string {
  const candidates = [
    process.env.SERVER_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.BACKEND_URL,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }
    const normalizedUrl = normalizeHttpUrl(candidate);
    if (normalizedUrl) {
      return normalizedUrl;
    }
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
