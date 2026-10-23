import * as React from "react";
import Box from "@mui/material/Box";
import { Rating, Typography } from "@mui/material";

interface RatingProps {
  rating: number | null;
  setRating: (rating: number | null) => void;
}

export default function RatingSelect({ rating, setRating }: RatingProps) {
  return (
    <Box>
      <Typography component="legend" mb={1}>
        Minimum Rating
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Rating
          name="simple-controlled"
          value={rating}
          precision={0.5}
          onChange={(_, newRating) => setRating(newRating)}
          max={10}
        />
      </Box>
    </Box>
  );
}
