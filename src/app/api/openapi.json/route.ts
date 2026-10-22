import { NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/openapi";

// Public OpenAPI 3.1 document for the portfolio API (rendered at /api-docs).
export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(buildOpenApiSpec(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
