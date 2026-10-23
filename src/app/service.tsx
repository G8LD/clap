// Client-side data layer for the film picker.
//
// Unlike the original visten-app, there is no external API base URL and no auth
// token: the browser simply calls the local Next.js Route Handlers under
// /api/film-picker, which proxy TMDB server-side (the TMDB token never reaches
// the client).

async function get(endpoint: string) {
  const response = await fetch("/api/film-picker" + endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? "Internal Server Error");
  }

  return data;
}

export async function get_random_film(filters: string) {
  return await get(filters);
}

export async function get_genres() {
  return await get("/genres");
}

export async function get_countries() {
  return await get("/countries");
}
