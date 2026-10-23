"use client";
import * as React from "react";
import { Box, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface TrailerModalProps {
  open: boolean;
  onClose: () => void;
  trailerKey: string | null;
  title?: string;
}

// Modal that embeds the film's YouTube trailer. Opened by clicking the poster.
export default function TrailerModal({
  open,
  onClose,
  trailerKey,
  title,
}: TrailerModalProps) {
  if (!trailerKey) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          // 16:9 responsive iframe.
          pt: "56.25%",
        }}
      >
        <IconButton
          aria-label="close trailer"
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            color: "#fff",
            backgroundColor: "rgba(0,0,0,0.5)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.75)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box
          component="iframe"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          title={title ? `${title} trailer` : "Trailer"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      </Box>
    </Dialog>
  );
}
