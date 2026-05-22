import type { NextRequest } from "next/server";

export function getAppOrigin(request?: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost.split(",")[0]?.trim()}`;
    }

    const host = request.headers.get("host");
    if (host) {
      const proto = host.includes("localhost") ? "http" : "https";
      return `${proto}://${host}`;
    }
  }

  return "http://localhost:3000";
}
