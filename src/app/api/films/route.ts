import { NextRequest, NextResponse } from "next/server";
import {
  buildFilters,
  fetchFilmById,
  fetchJson,
  filtersFromSearchParams,
  getTmdbEnv,
} from "./tmdb";

// This endpoint picks a random film and makes several TMDB calls; it must never
// be statically cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/films?<filters>&exclude=<id,id,...>
 *
 *  1. discover/movie?page=1<filters> → read total_results
 *  2. if 0 → 404 "No films found with the given filters"
 *  3. Pick a random film. If an `exclude` list is given (already-seen ids) and
 *     there are still unseen films available, retry a few times until the
 *     picked film is not excluded. When every matching film has been seen
 *     (total_results <= exclude count) the exclusion is ignored so a pick is
 *     always returned.
 *  4. movie/{id} with credits + videos appended; extract a YouTube trailer key.
 *  5. prefix poster_path, attach credits + trailer_key, return the film.
 */
export async function GET(request: NextRequest) {
  try {
    const { token, apiUrl, imageUrl } = await getTmdbEnv();
    const params = request.nextUrl.searchParams;
    const filters = filtersFromSearchParams(params);
    const fullFilters = buildFilters(filters);

    const excludeRaw = params.get("exclude");
    const excludeIds = new Set(
      (excludeRaw ? excludeRaw.split(",") : [])
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v))
    );

    // 1. Total number of films.
    const totalUrl = `${apiUrl}discover/movie?page=1${fullFilters}`;
    const totalData = (await fetchJson(totalUrl, token)) as Record<
      string,
      unknown
    >;
    const totalResults = totalData["total_results"];

    if (typeof totalResults !== "number") {
      throw new Error("Invalid total_results value");
    }

    if (totalResults === 0) {
      return NextResponse.json(
        { error: "No films found with the given filters" },
        { status: 404 }
      );
    }

    // Only exclude when there are unseen films left; otherwise all have been
    // shown and we must fall back to allowing any result.
    const applyExclusion = excludeIds.size > 0 && totalResults > excludeIds.size;

    // Pick a (preferably unseen) film id. TMDB only exposes the first 500
    // discover pages, so cap the random range accordingly.
    const pickableTotal = Math.min(totalResults, 500 * 20);
    const maxAttempts = applyExclusion ? 8 : 1;

    const pickFilmId = async (): Promise<number> => {
      const filmIndex = Math.floor(Math.random() * pickableTotal);
      const page = Math.floor(filmIndex / 20) + 1;
      const indexOnPage = filmIndex % 20;

      const pageUrl = `${apiUrl}discover/movie?page=${page}${fullFilters}`;
      const pageData = (await fetchJson(pageUrl, token)) as Record<
        string,
        unknown
      >;
      const results = pageData["results"];

      if (!Array.isArray(results)) {
        throw new Error("Invalid results format");
      }

      const selected = results[indexOnPage] as
        | Record<string, unknown>
        | undefined;
      const id = selected?.["id"];

      if (typeof id !== "number") {
        throw new Error("Film ID not found");
      }
      return id;
    };

    let filmId = await pickFilmId();
    for (
      let attempt = 1;
      attempt < maxAttempts && excludeIds.has(filmId);
      attempt++
    ) {
      filmId = await pickFilmId();
    }

    // 4. Fetch detailed film info (credits + videos + trailer key).
    const film = await fetchFilmById(filmId, { token, apiUrl, imageUrl });

    return NextResponse.json(film);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
