// Server-side TMDB helpers. This module is the direct equivalent of the former
// Rust proxy (visten-api/src/film_picker). It keeps the TMDB bearer token on the
// server: the browser never sees it, it only talks to the local /api routes.

export interface FilmFilters {
  with_genres?: string;
  vote_average?: string;
  release_year_min?: string;
  release_year_max?: string;
  runtime?: string;
  with_origin_country?: string;
}

interface TmdbEnv {
  token: string;
  apiUrl: string;
  imageUrl: string;
}

/**
 * Read TMDB configuration from the server environment.
 *
 * - TMDB_TOKEN:     v4 bearer token (secret, set via `wrangler secret put`).
 * - TMDB_API_URL:   base URL, MUST end with a trailing slash (e.g. ".../3/").
 * - TMDB_IMAGE_URL: base URL used to prefix poster_path.
 */
export function getTmdbEnv(): TmdbEnv {
  const token = process.env.TMDB_TOKEN;
  const apiUrl = process.env.TMDB_API_URL;
  const imageUrl = process.env.TMDB_IMAGE_URL;

  if (!token || !apiUrl || !imageUrl) {
    throw new Error(
      "Missing TMDB configuration (TMDB_TOKEN, TMDB_API_URL, TMDB_IMAGE_URL)."
    );
  }

  return { token, apiUrl, imageUrl };
}

/**
 * Fetch and parse JSON from TMDB, sending the bearer token. Throws on non-2xx,
 * mirroring the Rust `fetch_json` (which used `error_for_status`).
 */
export async function fetchJson(url: string, token: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      // TMDB returns JSON; be explicit.
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Build the TMDB discover query string from the provided filters.
 *
 * This reproduces the Rust `build_filters` EXACTLY:
 * it always starts with `&vote_count.gte=400`, then appends each provided
 * filter in the same order.
 */
export function buildFilters(filters: FilmFilters): string {
  let query = "&vote_count.gte=400";

  if (filters.with_genres) {
    query += `&with_genres=${filters.with_genres}`;
  }
  if (filters.vote_average) {
    query += `&vote_average.gte=${filters.vote_average}`;
  }
  if (filters.release_year_min) {
    query += `&primary_release_date.gte=${filters.release_year_min}-01-01`;
  }
  if (filters.release_year_max) {
    query += `&primary_release_date.lte=${filters.release_year_max}-12-31`;
  }
  if (filters.runtime) {
    query += `&with_runtime.lte=${filters.runtime}`;
  }
  if (filters.with_origin_country) {
    query += `&with_origin_country=${filters.with_origin_country}`;
  }

  return query;
}

/** Extract the FilmFilters out of a request's search params. */
export function filtersFromSearchParams(
  searchParams: URLSearchParams
): FilmFilters {
  const value = (key: string) => searchParams.get(key) ?? undefined;
  return {
    with_genres: value("with_genres"),
    vote_average: value("vote_average"),
    release_year_min: value("release_year_min"),
    release_year_max: value("release_year_max"),
    runtime: value("runtime"),
    with_origin_country: value("with_origin_country"),
  };
}
