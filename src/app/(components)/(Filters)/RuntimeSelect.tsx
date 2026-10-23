import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
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

interface RuntimeProps {
  hours: number;
  setHours: (hours: number) => void;
  minutes: number;
  setMinutes: (minutes: number) => void;
}

export default function RuntimeSelect({
  hours,
  setHours,
  minutes,
  setMinutes,
}: RuntimeProps) {
  const handleHours = (event: SelectChangeEvent) => {
    const hours = event.target.value as unknown as number;
    setHours(hours);
  };

  const handleMinutes = (event: SelectChangeEvent) => {
    const minutes = event.target.value as unknown as number;
    setMinutes(minutes);
  };

  return (
    <>
      <Typography component="legend" mb={1}>
        Maximum Runtime
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <FormControl variant="standard" fullWidth>
          <InputLabel id="hours-select-label">Hours</InputLabel>
          <Select
            labelId="hours-select-label"
            id="hours-select"
            value={hours as unknown as string}
            label="Hours"
            onChange={handleHours}
            sx={{ width: "100%" }}
            MenuProps={MenuProps}
          >
            {getTimeChoice(0, 3)}
          </Select>
        </FormControl>
        <FormControl variant="standard" fullWidth>
          <InputLabel id="minutes-select-label">Minutes</InputLabel>
          <Select
            labelId="minutes-select-label"
            id="minutes-select"
            value={minutes as unknown as string}
            label="Minutes"
            onChange={handleMinutes}
            sx={{ width: "100%" }}
            MenuProps={MenuProps}
          >
            {getTimeChoice(0, 55, 5)}
          </Select>
        </FormControl>
      </Box>
    </>
  );
}

function getTimeChoice(min: number, max: number, increment: number = 1) {
  const choices = [];
  for (let i = min; i <= max; i += increment) {
    choices.push(
      <MenuItem key={i} value={i}>
        {i}
      </MenuItem>
    );
  }
  return choices;
}
