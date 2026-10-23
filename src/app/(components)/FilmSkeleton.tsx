"use client";
import { Box, Skeleton, Stack, useMediaQuery } from "@mui/material";
import * as React from "react";
import theme from "@/app/theme";

// Loading placeholder that mirrors the layout of <FilmInfos /> so the page
// doesn't jump around once the real film data arrives.
export default function FilmSkeleton() {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    return (
      <Box mb={2}>
        <Stack spacing={1} sx={{ textAlign: "left" }}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
          <Stack direction="row" spacing={2} sx={{ my: 1 }}>
            <Skeleton variant="rounded" width={150} height={225} />
            <Box sx={{ flex: 1 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="text" />
              ))}
            </Box>
          </Stack>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Stack>
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={2} sx={{ margin: 2 }}>
      <Skeleton variant="rounded" width={300} height={450} />
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="35%" />
        <Skeleton variant="text" width="25%" sx={{ mb: 2 }} />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="65%" />
        <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="text" />
        ))}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={70} height={28} />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
