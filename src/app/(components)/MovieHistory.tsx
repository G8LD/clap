"use client";
import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { Film } from "../interface";

interface MovieHistoryProps {
  history: Film[];
  onSelect: (film: Film) => void;
  // The film currently shown in the main view; kept in storage but hidden from
  // the strip so it isn't duplicated with what's already on screen.
  currentId?: number;
}

// Horizontal, scrollable strip of previously picked films shown at the bottom
// of the page. Clicking a poster brings that film back into the main view.
export default function MovieHistory({
  history,
  onSelect,
  currentId,
}: MovieHistoryProps) {
  const items = history.filter((f) => f.id !== currentId);
  return (
    <Box sx={{ mt: 4, textAlign: "left" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        History
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No films yet. Pick a film and it will show up here.
        </Typography>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            overflowX: "auto",
            pb: 1,
          }}
        >
          {items.map((film) => (
            <Box
              key={film.id}
              onClick={() => onSelect(film)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(film);
              }}
              sx={{
                cursor: "pointer",
                flexShrink: 0,
                width: 100,
                "&:hover img": { opacity: 0.8 },
                "&:focus-visible": { outline: "2px solid #faaf00" },
              }}
              title={film.title}
            >
              <Image
                src={film.poster_path}
                alt={film.title}
                width={100}
                height={150}
                loading="lazy"
                style={{ borderRadius: 8, display: "block" }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {film.title}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
