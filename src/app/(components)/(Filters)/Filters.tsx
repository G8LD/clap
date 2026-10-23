import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import GenreSelect from "./GenreSelect";
import YearSelect from "./YearSelect";
import { Stack } from "@mui/material";
import RuntimeSelect from "./RuntimeSelect";
import RatingSelect from "./RatingSelect";
import CountrySelect from "./CountrySelect";
import { Country } from "../../interface";

interface FiltersProps {
  setFilters: (filters: string) => void;
}

export default function Filters({ setFilters }: FiltersProps) {
  const [open, setOpen] = React.useState(false);
  const [genres, setGenres] = React.useState<number[]>([]);
  const [rating, setRating] = React.useState<number | null>(0);
  const [minYear, setMinYear] = React.useState<string>("");
  const [maxYear, setMaxYear] = React.useState<string>("");
  const [hours, setHours] = React.useState<number>(0);
  const [minutes, setMinutes] = React.useState<number>(0);
  const [country, setCountry] = React.useState<Country | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    let filters = "?";
    if (genres.length) {
      filters = filters + "with_genres=" + genres.join(",") + "&";
    }
    if (rating) {
      filters = filters + "vote_average=" + rating + "&";
    }
    if (minYear) {
      filters = filters + "release_year_min=" + minYear + "&";
    }
    if (maxYear) {
      filters = filters + "release_year_max=" + maxYear + "&";
    }
    const runtime = hours * 60 + minutes;
    if (runtime) {
      filters = filters + "runtime=" + runtime + "&";
    }
    if (country) {
      filters = filters + "with_origin_country=" + country.iso_3166_1 + "&";
    }
    setFilters(filters);
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleClickOpen}
        sx={{ ml: 1, position: "absolute" }}
      >
        <FilterListIcon />
      </IconButton>
      <Dialog onClose={handleClose} open={open} sx={{ m: 0 }}>
        <DialogTitle>Filters</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <Stack spacing={1}>
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
            <GenreSelect
              selectedGenres={genres}
              setSelectedGenres={setGenres}
            />
            <CountrySelect country={country} setCountry={setCountry} />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
