import { Box, Grid, Link, Stack, Typography, useMediaQuery } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import LaunchIcon from "@mui/icons-material/Launch";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Image from "next/image";
import * as React from "react";
import { Credits, Film, Genre, Member } from "../interface";
import theme from "@/app/theme";

interface FilmInfosProps {
  film: Film;
  onPosterClick?: () => void;
}

const TMDB_MOVIE_URL = "https://www.themoviedb.org/movie/";

export default function FilmInfos({ film, onPosterClick }: FilmInfosProps) {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const directors = React.useMemo(
    () => crewNames(film.credits, (job) => job === "Director"),
    [film.credits]
  );
  const writers = React.useMemo(
    () =>
      crewNames(
        film.credits,
        (job) => job === "Screenplay" || job === "Writer"
      ),
    [film.credits]
  );

  return isMobile ? (
    <MobileLayout
      film={film}
      directors={directors}
      writers={writers}
      onPosterClick={onPosterClick}
    />
  ) : (
    <DesktopLayout
      film={film}
      directors={directors}
      writers={writers}
      onPosterClick={onPosterClick}
    />
  );
}

/* ----------------------------- helpers ----------------------------------- */

function crewNames(credits: Credits, matchJob: (job: string) => boolean) {
  return credits.crew
    .filter((m: Member) => matchJob(m.job))
    .map((m: Member) => m.name);
}

function releaseYear(dateString: string) {
  return new Date(dateString).getFullYear();
}

function formatRuntime(runtime: number) {
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes < 10 ? "0" : ""}${minutes}`;
}

function castNames(credits: Credits, count = 4) {
  return credits.cast
    .slice(0, count)
    .map((m: Member) => m.name)
    .join(", ");
}

/* --------------------------- shared pieces -------------------------------- */

// Poster image. When `onClick` is provided (a trailer exists) it becomes a
// button that reveals a play overlay on hover and opens the trailer modal.
function Poster({
  src,
  width,
  height,
  radius,
  shadow,
  onClick,
}: {
  src: string;
  width: number;
  height: number;
  radius: number;
  shadow: string;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);
  return (
    <Box
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? "Play trailer" : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
        borderRadius: `${radius}px`,
        boxShadow: shadow,
        overflow: "hidden",
        cursor: clickable ? "pointer" : "default",
        "& .clap-poster-overlay": { opacity: 0 },
        "&:hover .clap-poster-overlay, &:focus-visible .clap-poster-overlay": {
          opacity: clickable ? 1 : 0,
        },
        "&:focus-visible": { outline: "2px solid #e6b31e" },
      }}
    >
      <Image
        src={src}
        alt="Poster of the Film"
        loading="lazy"
        width={width}
        height={height}
        style={{ display: "block", borderRadius: `${radius}px` }}
      />
      {clickable && (
        <Box
          className="clap-poster-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.45)",
            transition: "opacity 0.2s",
          }}
        >
          <PlayCircleOutlineIcon
            sx={{ fontSize: Math.min(width, height) * 0.3, color: "#fff" }}
          />
        </Box>
      )}
    </Box>
  );
}

// Clickable title that links to the film's TMDB page.
function TitleLink({ film, fontSize }: { film: Film; fontSize?: number }) {
  return (
    <Link
      target="_blank"
      rel="noreferrer"
      href={TMDB_MOVIE_URL + film.id}
      underline="none"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 0.5,
        color: "inherit",
        width: "fit-content",
        "&:hover": { color: "secondary.main" },
      }}
    >
      <Typography variant="h5" fontSize={fontSize}>
        {film.title}
      </Typography>
      <LaunchIcon fontSize="small" />
    </Link>
  );
}

function MetaLine({ film }: { film: Film }) {
  return (
    <Box>
      <span>{releaseYear(film.release_date)}</span>
      {" • "}
      <span>{formatRuntime(film.runtime)}</span>
    </Box>
  );
}

function RatingLine({ film }: { film: Film }) {
  return (
    <Box sx={{ alignItems: "center", display: "inline-flex" }}>
      <StarIcon sx={{ color: "#faaf00" }} />
      <Typography>{film.vote_average.toFixed(1)}/10</Typography>
      <Typography variant="caption">
        &nbsp;based on {film.vote_count} votes
      </Typography>
    </Box>
  );
}

function CreditLine({
  label,
  names,
  minHeight,
}: {
  label: string;
  names: string[];
  minHeight?: string;
}) {
  const plural = names.length > 1 ? "s" : "";
  return (
    <p style={minHeight ? { minHeight } : undefined}>
      <span style={{ fontWeight: "bold" }}>
        {label}
        {plural}
      </span>
      &emsp;{names.join(", ")}
    </p>
  );
}

function GenreChips({ genres, minHeight }: { genres: Genre[]; minHeight?: string }) {
  return (
    <Grid container spacing={1} sx={minHeight ? { minHeight } : undefined}>
      {genres.map((genre) => (
        <Grid key={genre.id}>
          <span
            style={{
              padding: 5,
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: 25,
              whiteSpace: "nowrap",
              fontSize: "0.8em",
            }}
          >
            {genre.name}
          </span>
        </Grid>
      ))}
    </Grid>
  );
}

interface LayoutProps {
  film: Film;
  directors: string[];
  writers: string[];
  onPosterClick?: () => void;
}

/* ------------------------------ layouts ----------------------------------- */

function DesktopLayout({ film, directors, writers, onPosterClick }: LayoutProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ margin: 2 }}
    >
      <div>
        <Poster
          src={film.poster_path}
          width={300}
          height={450}
          radius={25}
          shadow="0 12px 40px rgba(0,0,0,0.7)"
          onClick={onPosterClick}
        />
      </div>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ textAlign: "left" }}>
          <TitleLink film={film} />
          <MetaLine film={film} />
          <RatingLine film={film} />
        </Box>
        <Stack direction="column" spacing={1} sx={{ textAlign: "left" }}>
          <CreditLine label="Director" names={directors} />
          <CreditLine label="Writer" names={writers} />
          <CreditLine label="Cast" names={[castNames(film.credits)]} />
          <div>
            <Typography variant="subtitle1">Overview</Typography>
            <Typography
              sx={{
                textAlign: "justify",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 8,
              }}
            >
              {film.overview}
            </Typography>
          </div>
          <GenreChips genres={film.genres} />
        </Stack>
      </Box>
    </Stack>
  );
}

function MobileLayout({ film, directors, writers, onPosterClick }: LayoutProps) {
  const creditMinHeight = "calc(2 * 1.5em)";
  return (
    <Box fontSize={10} mb={2}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ textAlign: "left" }}>
          <TitleLink film={film} fontSize={15} />
          <MetaLine film={film} />
          <RatingLine film={film} />
        </Box>
        <Stack direction="row" spacing={2} sx={{ mb: 1.5, height: 225 }}>
          <Poster
            src={film.poster_path}
            width={150}
            height={225}
            radius={12}
            shadow="0 8px 28px rgba(0,0,0,0.7)"
            onClick={onPosterClick}
          />
          <Typography
            sx={{
              textAlign: "justify",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: 15,
              fontSize: 10,
            }}
          >
            {film.overview}
          </Typography>
        </Stack>
        <Stack direction="column" spacing={0.1} sx={{ textAlign: "left", mb: 1 }}>
          <CreditLine
            label="Director"
            names={directors}
            minHeight={creditMinHeight}
          />
          <CreditLine
            label="Writer"
            names={writers}
            minHeight={creditMinHeight}
          />
          <CreditLine
            label="Cast"
            names={[castNames(film.credits)]}
            minHeight={creditMinHeight}
          />
        </Stack>
        <GenreChips genres={film.genres} minHeight={creditMinHeight} />
      </Box>
    </Box>
  );
}
