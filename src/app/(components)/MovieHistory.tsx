"use client";
import * as React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import { Film } from "../interface";

interface MovieHistoryProps {
  history: Film[];
  onSelect: (film: Film) => void;
  // The film currently shown in the main view; kept in storage but hidden from
  // the strip so it isn't duplicated with what's already on screen.
  currentId?: number;
}

// Full-width, horizontally scrollable strip of previously picked films, with
// left/right navigation arrows that appear only when the content overflows.
export default function MovieHistory({
  history,
  onSelect,
  currentId,
}: MovieHistoryProps) {
  const items = history.filter((f) => f.id !== currentId);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);

  const updateArrows = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 1);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows, items.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Scroll by ~90% of the visible width for a natural "page" feel.
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <Box sx={{ mt: 4, width: "100%", textAlign: "left" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        History
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No films yet. Pick a film and it will show up here.
        </Typography>
      ) : (
        <Box sx={{ position: "relative", width: "100%" }}>
          {/* Left arrow */}
          <NavArrow
            side="left"
            visible={canLeft}
            onClick={() => scrollByPage(-1)}
          />

          {/* Scrollable strip */}
          <Box
            ref={scrollerRef}
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              scrollBehavior: "smooth",
              pb: 1,
              // Hide the scrollbar but keep scrolling (wheel/trackpad/touch).
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
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
                  "&:focus-visible": { outline: "2px solid #e6b31e" },
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
          </Box>

          {/* Right arrow */}
          <NavArrow
            side="right"
            visible={canRight}
            onClick={() => scrollByPage(1)}
          />
        </Box>
      )}
    </Box>
  );
}

// Edge-anchored navigation arrow with a gradient fade behind it. Rendered
// (but hidden) regardless of state so it doesn't reflow the strip.
function NavArrow({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const isLeft = side === "left";
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        bottom: 8, // align with pb of the strip
        [isLeft ? "left" : "right"]: 0,
        width: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s",
        zIndex: 1,
        background: `linear-gradient(to ${isLeft ? "right" : "left"}, var(--mui-palette-background-default), transparent)`,
      }}
    >
      <IconButton
        aria-label={isLeft ? "Scroll history left" : "Scroll history right"}
        onClick={onClick}
        size="small"
        tabIndex={visible ? 0 : -1}
        sx={{
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.75)" },
        }}
      >
        {isLeft ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
    </Box>
  );
}
