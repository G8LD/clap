import { NextResponse } from "next/server";
import { fetchJson, getTmdbEnv } from "../tmdb";

export const dynamic = "force-dynamic";

/**
 * GET /api/film-picker/genres
 *
 * Reproduces the Rust `get_genres`: calls `genre/movie/list` and returns the
 * `genres` array. Genres rarely change, so we allow edge/browser caching via a
 * Cache-Control header (no R2 / ISR involved).
 */
export async function GET() {
  try {
    const { token, apiUrl } = getTmdbEnv();
    const data = (await fetchJson(`${apiUrl}genre/movie/list`, token)) as Record<
      string,
      unknown
    >;
    const genres = data["genres"] ?? [];

    return NextResponse.json(genres, {
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
