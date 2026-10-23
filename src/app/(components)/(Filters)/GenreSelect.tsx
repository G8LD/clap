import * as React from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { Genre } from "../../interface";
import { get_genres } from "../../service";
import { Typography } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

interface GenreProps {
  selectedGenres: number[];
  setSelectedGenres: (genres: number[]) => void;
}

export default function GenreSelect({
  selectedGenres,
  setSelectedGenres,
}: GenreProps) {
  const [genres, setGenres] = React.useState<Genre[]>([]);
  React.useEffect(() => {
    get_genres().then((data) => {
      setGenres(data);
    });
  }, []);

  const handleChange = (event: SelectChangeEvent<typeof selectedGenres>) => {
    const value = event.target.value as unknown as number[];
    setSelectedGenres(value);
  };

  return (
    <div>
      <Typography component="legend" mb={1}>
        Genre
      </Typography>
      <FormControl variant="standard" sx={{ width: "275px" }}>
        <Select
          multiple
          value={selectedGenres}
          onChange={handleChange}
          renderValue={(selected) => {
            const genresName = genres
              .filter((genre) => selected.includes(genre.id))
              .map((genre) => genre.name);
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {genresName.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            );
          }}
          MenuProps={MenuProps}
        >
          {genres.map((genre) => (
            <MenuItem key={genre.id} value={genre.id}>
              {genre.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
