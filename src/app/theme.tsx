"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: "var(--font-zen-dots)",
  },
  palette: {
    mode: "dark",
    background: {
      default: "#080808",
    },
    primary: {
      main: "#f3f3f3",
    },
  },
  components: {
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
  },
});

export default theme;
