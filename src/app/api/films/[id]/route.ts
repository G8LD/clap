import { NextRequest, NextResponse } from "next/server";
import { fetchFilmById, getTmdbEnv } from "../tmdb";

export const dynamic = "force-dynamic";

/**
 * GET /api/films/{id}
 *
 * Fetch a single film by its TMDB id (with credits, videos and a trailer key),
 * used to restore the film referenced by ?movie=<id> in the page URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filmId = Number(id);
    if (Number.isNaN(filmId)) {
      return NextResponse.json({ error: "Invalid film id" }, { status: 400 });
    }

    const env = await getTmdbEnv();
    const film = await fetchFilmById(filmId, env);
    return NextResponse.json(film);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
