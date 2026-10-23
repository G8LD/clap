import { NextRequest, NextResponse } from "next/server";
import {
  buildFilters,
  fetchJson,
  filtersFromSearchParams,
  getTmdbEnv,
} from "./tmdb";

// This endpoint picks a random film and makes several TMDB calls; it must never
// be statically cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/film-picker?<filters>
 *
 * Reproduces the Rust `get_random_film` logic exactly:
 *  1. discover/movie?page=1<filters> → read total_results
 *  2. if 0 → error "No films found with the given filters"
 *  3. pick random index in [0, total_results); page = index/20 + 1,
 *     index_on_page = index % 20
 *  4. discover/movie?page=<page><filters> → results[index_on_page].id
 *  5. movie/{id} and movie/{id}/credits
 *  6. prefix poster_path with the image URL, attach credits, return the film
 */
export async function GET(request: NextRequest) {
  try {
    const { token, apiUrl, imageUrl } = getTmdbEnv();
    const filters = filtersFromSearchParams(request.nextUrl.searchParams);
    const fullFilters = buildFilters(filters);

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

    // 2. Pick a random film.
    const filmIndex = Math.floor(Math.random() * totalResults);
    const page = Math.floor(filmIndex / 20) + 1;
    const indexOnPage = filmIndex % 20;

    // 3. Fetch the page containing the selected film.
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
    const filmId = selected?.["id"];

    if (typeof filmId !== "number") {
      throw new Error("Film ID not found");
    }

    // 4. Fetch detailed film info and credits.
    const film = (await fetchJson(
      `${apiUrl}movie/${filmId}`,
      token
    )) as Record<string, unknown>;
    const credits = await fetchJson(`${apiUrl}movie/${filmId}/credits`, token);

    // 5. Prefix poster_path with the image URL.
    if (typeof film["poster_path"] === "string") {
      film["poster_path"] = `${imageUrl}${film["poster_path"]}`;
    }

    film["credits"] = credits;

    return NextResponse.json(film);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
