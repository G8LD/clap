// Client-side data layer for the films picker.
//
// There is no external API base URL and no auth token: the browser calls the
// local Next.js Route Handlers under /api/films, which proxy TMDB server-side
// (the TMDB token never reaches the client).

import { Country, Film, Genre } from "./interface";

const API_BASE = "/api/films";

/** Error that also carries the HTTP status, so callers can tailor the message. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function get<T>(endpoint: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE + endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // fetch() only rejects on network-level failures (offline, DNS, etc.).
    throw new ApiError(
      "Can't reach the server. Check your connection and try again.",
      0
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. an HTML error page); leave data undefined.
  }

  if (!response.ok) {
    const message =
      (data as { error?: string } | undefined)?.error ??
      "Internal Server Error";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function get_random_film(
  filters: string,
  excludeIds: number[] = []
): Promise<Film> {
  let endpoint = filters;
  if (excludeIds.length) {
    const sep = endpoint.includes("?") ? "&" : "?";
    endpoint += `${sep}exclude=${excludeIds.join(",")}`;
  }
  return get<Film>(endpoint);
}

export function get_film_by_id(id: number): Promise<Film> {
  return get<Film>(`/${id}`);
}

export function get_genres(): Promise<Genre[]> {
  return get<Genre[]>("/genres");
}

export function get_countries(): Promise<Country[]> {
  return get<Country[]>("/countries");
}

/** Turn any thrown error into a short, friendly message for the UI. */
export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "No films match these filters. Try loosening them a little.";
    }
    if (error.status === 0 || error.status >= 500) {
      return error.status === 0
        ? error.message
        : "Something went wrong on our side. Please try again in a moment.";
    }
    return error.message;
  }
  return "Unexpected error. Please try again.";
}
