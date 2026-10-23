"use client";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import GenreSelect from "./GenreSelect";
import YearSelect from "./YearSelect";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import RuntimeSelect from "./RuntimeSelect";
import RatingSelect from "./RatingSelect";
import CountrySelect from "./CountrySelect";
import { Country } from "../../interface";
import theme from "../../theme";
import { useDebounce } from "../useDebounce";
import {
  buildQuery,
  EMPTY_FILTERS,
  FilterState,
  parseQuery,
} from "./filterState";

interface FiltersProps {
  // Called (debounced) with the query string whenever a filter changes, so the
  // parent can use it for the next pick.
  onQueryChange: (query: string) => void;
  // Mobile drawer open state is owned by the parent so the trigger button can
  // live next to the Pick button.
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  // Reports how many filters are active, so the parent's mobile trigger can
  // show a count.
  onActiveCountChange?: (count: number) => void;
}

export default function Filters({
  onQueryChange,
  mobileOpen = false,
  onMobileOpenChange,
  onActiveCountChange,
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Initialise state from the URL exactly once.
  const initial = React.useMemo<FilterState>(
    () => parseQuery(new URLSearchParams(searchParams.toString())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [genres, setGenres] = React.useState<number[]>(initial.genres);
  const [rating, setRating] = React.useState<number | null>(initial.rating);
  const [minYear, setMinYear] = React.useState<string>(initial.minYear);
  const [maxYear, setMaxYear] = React.useState<string>(initial.maxYear);
  const [hours, setHours] = React.useState<number>(initial.hours);
  const [minutes, setMinutes] = React.useState<number>(initial.minutes);
  const [country, setCountry] = React.useState<Country | null>(
    initial.country
  );

  const query = buildQuery({
    genres,
    rating,
    minYear,
    maxYear,
    hours,
    minutes,
    country,
  });

  // Count active filters for the mobile trigger badge/label.
  const activeCount =
    (genres.length ? 1 : 0) +
    (rating ? 1 : 0) +
    (minYear ? 1 : 0) +
    (maxYear ? 1 : 0) +
    (hours || minutes ? 1 : 0) +
    (country ? 1 : 0);

  React.useEffect(() => {
    onActiveCountChange?.(activeCount);
  }, [activeCount, onActiveCountChange]);

  // Debounce so quickly toggling several filters only triggers one URL update
  // and one refetch.
  const debouncedQuery = useDebounce(query, 500);

  React.useEffect(() => {
    // Reflect filters in the browser URL (shallow, no scroll jump) while
    // preserving the current ?movie=<id> param owned by the page.
    const params = new URLSearchParams(debouncedQuery.replace(/^\?/, ""));
    const currentMovie = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    ).get("movie");
    if (currentMovie) params.set("movie", currentMovie);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    onQueryChange(debouncedQuery);
  }, [debouncedQuery, pathname, router, onQueryChange]);

  const handleReset = () => {
    setGenres(EMPTY_FILTERS.genres);
    setRating(EMPTY_FILTERS.rating);
    setMinYear(EMPTY_FILTERS.minYear);
    setMaxYear(EMPTY_FILTERS.maxYear);
    setHours(EMPTY_FILTERS.hours);
    setMinutes(EMPTY_FILTERS.minutes);
    setCountry(EMPTY_FILTERS.country);
  };

  const body = (
    <Stack spacing={2}>
      <YearSelect
        minYear={minYear}
        setMinYear={setMinYear}
        maxYear={maxYear}
        setMaxYear={setMaxYear}
      />
      <RatingSelect rating={rating} setRating={setRating} />
      <RuntimeSelect
        hours={hours}
        setHours={setHours}
        minutes={minutes}
        setMinutes={setMinutes}
      />
      <GenreSelect selectedGenres={genres} setSelectedGenres={setGenres} />
      <CountrySelect country={country} setCountry={setCountry} />
      <Button variant="text" onClick={handleReset}>
        Reset filters
      </Button>
    </Stack>
  );

  // --- Mobile: only the bottom drawer. The trigger button is rendered by the
  // parent (next to the Pick button); open state is controlled via props. ---
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={() => onMobileOpenChange?.(false)}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "85vh",
            },
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: "left" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon fontSize="small" />
              <Typography variant="h6">Filters</Typography>
            </Box>
            <IconButton
              aria-label="close filters"
              onClick={() => onMobileOpenChange?.(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {body}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onMobileOpenChange?.(false)}
          >
            Done
          </Button>
        </Box>
      </Drawer>
    );
  }

  // --- Desktop: static sidebar panel. ---
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: "left" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <FilterListIcon fontSize="small" />
        <Typography variant="h6">Filters</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {body}
    </Paper>
  );
}
