import { Country } from "../../interface";

// A single source of truth for the films filters on the client.
// The query-string keys match exactly what the /api/films route expects
// (see api/films/tmdb.ts), so the same string is used both for the
// browser URL and for the API request.
export interface FilterState {
  genres: number[];
  rating: number | null;
  minYear: string;
  maxYear: string;
  hours: number;
  minutes: number;
  country: Country | null;
}

export const EMPTY_FILTERS: FilterState = {
  genres: [],
  rating: 0,
  minYear: "",
  maxYear: "",
  hours: 0,
  minutes: 0,
  country: null,
};

/** Build the `?a=b&c=d` query string consumed by the API and shown in the URL. */
export function buildQuery(state: FilterState): string {
  const params = new URLSearchParams();

  if (state.genres.length) {
    params.set("with_genres", state.genres.join(","));
  }
  if (state.rating) {
    params.set("vote_average", String(state.rating));
  }
  if (state.minYear) {
    params.set("release_year_min", state.minYear);
  }
  if (state.maxYear) {
    params.set("release_year_max", state.maxYear);
  }
  const runtime = state.hours * 60 + state.minutes;
  if (runtime) {
    params.set("runtime", String(runtime));
  }
  if (state.country) {
    params.set("with_origin_country", state.country.iso_3166_1);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Parse filters out of the browser URL search params.
 *
 * Note: `country` is only partially reconstructed here (iso code). The
 * CountrySelect fills in the human-readable names once the country list loads.
 */
export function parseQuery(params: URLSearchParams): FilterState {
  const genresRaw = params.get("with_genres");
  const genres = genresRaw
    ? genresRaw
        .split(",")
        .map((g) => Number(g))
        .filter((g) => !Number.isNaN(g))
    : [];

  const ratingRaw = params.get("vote_average");
  const rating = ratingRaw ? Number(ratingRaw) : 0;

  const runtimeRaw = params.get("runtime");
  const runtime = runtimeRaw ? Number(runtimeRaw) : 0;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  const countryIso = params.get("with_origin_country");
  const country: Country | null = countryIso
    ? { iso_3166_1: countryIso, english_name: countryIso, native_name: countryIso }
    : null;

  return {
    genres,
    rating: Number.isNaN(rating) ? 0 : rating,
    minYear: params.get("release_year_min") ?? "",
    maxYear: params.get("release_year_max") ?? "",
    hours,
    minutes,
    country,
  };
}
