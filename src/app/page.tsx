"use client";
import React, { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Box, Button, Typography, useMediaQuery } from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import FilterListIcon from "@mui/icons-material/FilterList";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import { friendlyError, get_film_by_id, get_random_film } from "./service";
import FilmInfos from "./(components)/FilmInfos";
import FilmSkeleton from "./(components)/FilmSkeleton";
import MovieHistory from "./(components)/MovieHistory";
import TrailerModal from "./(components)/TrailerModal";
import Filters from "./(components)/(Filters)/Filters";
import { useLocalStorage } from "./(components)/useLocalStorage";
import theme from "./theme";
import { Film } from "./interface";

const MAX_HISTORY = 12;

function FilmPickerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [film, setFilm] = React.useState<Film | null>(null);
  const [history, setHistory] = useLocalStorage<Film[]>("clap:history", []);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filterCount, setFilterCount] = React.useState(0);
  const [trailerOpen, setTrailerOpen] = React.useState(false);

  // Latest filter query string (kept in sync with the URL by <Filters />).
  const filtersRef = React.useRef<string>("");
  const didInitialFetch = React.useRef(false);
  // Always holds the currently displayed film so get_film can read it without
  // being re-created on every film change (and without nesting state setters,
  // which double-fire under React Strict Mode and duplicated the history).
  const filmRef = React.useRef<Film | null>(null);
  // Mirror of history so the stable get_film callback can read the seen ids.
  const historyRef = React.useRef<Film[]>(history);
  React.useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Reflect the current film id in the URL (?movie=<id>), preserving the
  // filter params already present.
  const setMovieInUrl = React.useCallback(
    (id: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === null) {
        params.delete("movie");
      } else {
        params.set("movie", String(id));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const showFilm = React.useCallback(
    (next: Film) => {
      // Record the film as soon as it's shown (most-recent-first, deduped), so
      // it is stored even if the user reloads without picking again.
      setHistory((h) => [next, ...h.filter((f) => f.id !== next.id)].slice(0, MAX_HISTORY));
      filmRef.current = next;
      setFilm(next);
      setMovieInUrl(next.id);
    },
    [setHistory, setMovieInUrl]
  );

  // Run a film-fetching promise with shared loading/error handling.
  const runFetch = React.useCallback(
    (request: Promise<Film>) => {
      setAlertMessage("");
      setLoading(true);
      request
        .then(showFilm)
        .catch((error) => setAlertMessage(friendlyError(error)))
        .finally(() => setLoading(false));
    },
    [showFilm]
  );

  const get_film = React.useCallback(() => {
    // Exclude everything already seen: history + the current film.
    const seen = new Set<number>(historyRef.current.map((f) => f.id));
    if (filmRef.current) seen.add(filmRef.current.id);
    runFetch(get_random_film(filtersRef.current, Array.from(seen)));
  }, [runFetch]);

  // Load a specific film by id (used when the page is opened with ?movie=<id>).
  const load_film_by_id = React.useCallback(
    (id: number) => runFetch(get_film_by_id(id)),
    [runFetch]
  );

  // Receives the (debounced) query string from the Filters sidebar. We only
  // trigger the very first load here; afterwards the user drives picks with
  // the button so changing a filter doesn't yank the film out from under them.
  const handleQueryChange = React.useCallback(
    (query: string) => {
      filtersRef.current = query;
      if (!didInitialFetch.current) {
        didInitialFetch.current = true;
        // If the URL references a specific movie, load it; otherwise pick one.
        const movieId = Number(
          new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : ""
          ).get("movie")
        );
        if (movieId && !Number.isNaN(movieId)) {
          load_film_by_id(movieId);
        } else {
          get_film();
        }
      }
    },
    [get_film, load_film_by_id]
  );

  // Keyboard shortcut: Space picks a new film (ignored while typing in an
  // input/textarea/select or when the trailer modal is open).
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable;
      if (typing || trailerOpen) return;
      e.preventDefault();
      if (!loading) get_film();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [get_film, loading, trailerOpen]);

  return (
    <Box
      sx={{
        textAlign: "center",
        minHeight: "100vh",
        width: "100%",
        px: { xs: 2, md: 4 },
        py: 3,
        boxSizing: "border-box",
      }}
    >
      {/* Title header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <MovieFilterIcon sx={{ color: "secondary.main", fontSize: 32 }} />
        <Typography
          variant="h4"
          sx={{
            textAlign: "left",
            letterSpacing: "0.15em",
            textShadow: "0 0 18px rgba(230,179,30,0.35)",
          }}
        >
          CLAP
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        {/* Sidebar (desktop) / drawer host (mobile). On mobile the Filters
            component only renders a portaled Drawer, so `display: contents`
            keeps this wrapper out of the flex layout (no empty column/gap). */}
        <Box
          sx={{
            display: { xs: "contents", md: "block" },
            width: { md: 320 },
            flexShrink: 0,
            position: { md: "sticky" },
            top: { md: 24 },
          }}
        >
          <Filters
            onQueryChange={handleQueryChange}
            mobileOpen={drawerOpen}
            onMobileOpenChange={setDrawerOpen}
            onActiveCountChange={setFilterCount}
          />
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, width: "100%" }}>
          {/* Fixed-height stage so the Pick button never shifts position
              whether we show the skeleton, a film, or an error. Taller films
              scroll inside the stage instead of pushing the button down. */}
          <Box
            sx={{
              position: "relative",
              height: { xs: 320, sm: 500 },
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {/* Error overlays the top of the stage (on top of the movie) so it
                doesn't push the Pick button down. */}
            {alertMessage && (
              <Alert
                severity="error"
                onClose={() => setAlertMessage("")}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                }}
              >
                {alertMessage}
              </Alert>
            )}
            {loading ? (
              <FilmSkeleton />
            ) : (
              film && (
                <FilmInfos
                  film={film}
                  onPosterClick={
                    film.trailer_key ? () => setTrailerOpen(true) : undefined
                  }
                />
              )
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 1,
            }}
          >
            <Button
              disabled={loading}
              variant="contained"
              color="secondary"
              size="large"
              onClick={get_film}
              startIcon={
                <CasinoIcon
                  sx={{
                    animation: loading
                      ? "clap-spin 0.9s linear infinite"
                      : "none",
                    "@keyframes clap-spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" },
                    },
                  }}
                />
              }
            >
              Pick
            </Button>
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setDrawerOpen(true)}
              >
                Filters{filterCount > 0 ? ` (${filterCount})` : ""}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <MovieHistory
        history={history}
        onSelect={showFilm}
        currentId={film?.id}
      />

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={film?.trailer_key ?? null}
        title={film?.title}
      />
    </Box>
  );
}

export default function FilmPicker() {
  // useSearchParams (used inside <Filters />) requires a Suspense boundary.
  return (
    <Suspense fallback={<FilmSkeleton />}>
      <FilmPickerContent />
    </Suspense>
  );
}
