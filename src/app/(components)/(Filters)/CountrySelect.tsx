import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Country } from "../../interface";
import { get_countries } from "../../service";
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

interface CountryProps {
  country: Country | null;
  setCountry: (country: Country | null) => void;
}

export default function CountrySelect({ country, setCountry }: CountryProps) {
  const [countries, setCountries] = React.useState<Country[]>([]);

  React.useEffect(() => {
    get_countries().then((data) => {
      const sortedCountries = data.sort((a: Country, b: Country) => {
        return a.english_name.localeCompare(b.english_name);
      });
      setCountries(sortedCountries);
    });
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    const selectedId = event.target.value;
    const selectedCountry =
      countries.find((c) => c.iso_3166_1 === selectedId) || null;
    setCountry(selectedCountry);
  };

  return (
    <div>
      <Typography component="legend" mb={1}>
        Country
      </Typography>
      <FormControl variant="standard" sx={{ width: "275px" }}>
        <Select
          value={country ? country.iso_3166_1 : ""}
          onChange={handleChange}
          MenuProps={MenuProps}
        >
          {countries.map((c) => (
            <MenuItem
              key={c.iso_3166_1}
              value={c.iso_3166_1}
              sx={{ width: "275px" }}
            >
              {c.native_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
