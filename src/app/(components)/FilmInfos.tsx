import {
  Box,
  Grid,
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import Image from "next/image";
import * as React from "react";
import { Member, Film } from "../interface";
import LaunchIcon from "@mui/icons-material/Launch";
import theme from "@/app/theme";

interface FilmInfosProps {
  film: Film;
}

export default function FilmInfos({ film }: FilmInfosProps) {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [directors, setDirectors] = React.useState<string[]>([]);
  const [writers, setWriters] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!film) return;

    const directors = film.credits.crew
      .filter((member: Member) => member.job === "Director")
      .map((member: Member) => member.name);
    setDirectors(directors);

    const writers = film.credits.crew
      .filter(
        (member: Member) =>
          member.job === "Screenplay" || member.job === "Writer"
      )
      .map((member: Member) => member.name);
    setWriters(writers);
  }, [film]);

  if (isMobile) return mobileFormat(film, directors, writers);
  return computerFormat(film, directors, writers);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.getFullYear();
}

function formatRuntime(runtime: number) {
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  let formattedRuntime = hours + "h ";
  if (minutes < 10) {
    formattedRuntime += "0";
  }
  formattedRuntime += minutes;
  return formattedRuntime;
}

function computerFormat(film: Film, directors: string[], writers: string[]) {
  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 2 }}
        sx={{
          margin: 2,
        }}
      >
        <div>
          <Image
            src={film.poster_path}
            alt="Poster of the Film"
            loading="lazy"
            width={300}
            height={450}
            style={{ borderRadius: "25px" }}
          />
        </div>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ textAlign: "left" }}>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
              <Typography variant="h5">{film.title}</Typography>
              <Link
                target="_blank"
                rel="noreferrer"
                href={"https://www.themoviedb.org/movie/" + film.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <LaunchIcon />
              </Link>
            </Box>
            <Box>
              <span>{formatDate(film.release_date)}</span>
              {" • "}
              <span>{formatRuntime(film.runtime)}</span>
            </Box>
            <Box sx={{ alignItems: "center", display: "inline-flex" }}>
              <StarIcon sx={{ color: "#faaf00" }} />
              <Typography>{film.vote_average.toFixed(1)}/10</Typography>
              <Typography variant="caption">
                &nbsp;based on {film.vote_count} votes
              </Typography>
            </Box>
          </Box>
          <Stack direction="column" spacing={1} sx={{ textAlign: "left" }}>
            <p>
              <span style={{ fontWeight: "bold" }}>
                Director{directors.length > 1 && "s"}
              </span>
              &emsp; {directors.join(", ")}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>
                Writer{writers.length > 1 && "s"}
              </span>
              &emsp;{writers.join(", ")}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Cast</span>
              &emsp;
              {film.credits.cast
                .slice(0, 4)
                .map((member: Member) => member.name)
                .join(", ")}
            </p>
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
            <Grid container spacing={1}>
              {film.genres.map((genre: { id: number; name: string }) => (
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
          </Stack>
        </Box>
      </Stack>
    </>
  );
}

function mobileFormat(film: Film, directors: string[], writers: string[]) {
  return (
    <Box fontSize={10} mb={2}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ textAlign: "left" }}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            <Typography variant="h5" fontSize={15}>
              {film.title}
            </Typography>
            <Link
              target="_blank"
              rel="noreferrer"
              href={"https://www.themoviedb.org/movie/" + film.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              <LaunchIcon />
            </Link>
          </Box>
          <Box>
            <span>{formatDate(film.release_date)}</span>
            {" • "}
            <span>{formatRuntime(film.runtime)}</span>
          </Box>
          <Box sx={{ alignItems: "center", display: "inline-flex" }}>
            <StarIcon sx={{ color: "#faaf00" }} />
            <Typography>{film.vote_average.toFixed(1)}/10</Typography>
            <Typography variant="caption">
              &nbsp;based on {film.vote_count} votes
            </Typography>
          </Box>
        </Box>
        <Stack
          direction={{ xs: "row", sm: "row" }}
          spacing={2}
          sx={{
            mb: 1.5,
            height: 225,
          }}
        >
          <Image
            src={film.poster_path}
            alt="Poster of the Film"
            loading="lazy"
            width={150}
            height={225}
            style={{ borderRadius: "12px" }}
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
        <Stack
          direction="column"
          spacing={0.1}
          sx={{ textAlign: "left", mb: 1 }}
        >
          <p style={{ minHeight: "calc(2 * 1.5em)" }}>
            <span style={{ fontWeight: "bold" }}>
              Director{directors.length > 1 && "s"}
            </span>
            &emsp; {directors.join(", ")}
          </p>
          <p style={{ minHeight: "calc(2 * 1.5em)" }}>
            <span style={{ fontWeight: "bold" }}>
              Writer{writers.length > 1 && "s"}
            </span>
            &emsp;{writers.join(", ")}
          </p>
          <p style={{ minHeight: "calc(2 * 1.5em)" }}>
            <span style={{ fontWeight: "bold" }}>Cast</span>
            &emsp;
            {film.credits.cast
              .slice(0, 4)
              .map((member: Member) => member.name)
              .join(", ")}
          </p>
        </Stack>
        <Grid container spacing={1} sx={{ minHeight: "calc(2 * 1.5em)" }}>
          {film.genres.map((genre: { id: number; name: string }) => (
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
      </Box>
    </Box>
  );
}
