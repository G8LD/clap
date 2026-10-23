import { NextResponse } from "next/server";
import { fetchJson, getTmdbEnv } from "../tmdb";

export const dynamic = "force-dynamic";

/**
 * GET /api/films/countries
 *
 * Reproduces the Rust `get_countries`: calls `configuration/countries` and
 * returns the response as-is (an array of countries). Countries rarely change,
 * so we allow edge/browser caching via a Cache-Control header (no R2 / ISR).
 */
export async function GET() {
  try {
    const { token, apiUrl } = await getTmdbEnv();
    const data = await fetchJson(`${apiUrl}configuration/countries`, token);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
