"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  typography: {
    // Body text uses Roboto for readability; display headings keep Zen Dots.
    fontFamily: "var(--font-roboto)",
    h1: { fontFamily: "var(--font-zen-dots)" },
    h2: { fontFamily: "var(--font-zen-dots)" },
    h3: { fontFamily: "var(--font-zen-dots)" },
    h4: { fontFamily: "var(--font-zen-dots)" },
    h5: { fontFamily: "var(--font-zen-dots)" },
    h6: { fontFamily: "var(--font-zen-dots)" },
  },
  palette: {
    mode: "dark",
    background: {
      default: "#080808",
      paper: "#121212",
    },
    primary: {
      main: "#f3f3f3",
    },
    secondary: {
      // Cinema-marquee gold accent.
      main: "#e6b31e",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          // Cinematic dark backdrop: a soft gold spotlight fading into
          // near-black, with a subtle vignette in the far corner.
          backgroundImage:
            "radial-gradient(1200px 600px at 50% -10%, rgba(230,179,30,0.10), rgba(8,8,8,0) 60%), " +
            "radial-gradient(900px 900px at 100% 100%, rgba(230,179,30,0.05), rgba(8,8,8,0) 55%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "8px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          "--Paper-overlay": "none !important",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          letterSpacing: "0.5px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(230, 179, 30, 0.15)",
        },
      },
    },
  },
});

export default theme;
