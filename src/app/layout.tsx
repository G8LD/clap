import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { Zen_Dots, Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

const zen_dots = Zen_Dots({
  weight: "400",
  variable: "--font-zen-dots",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clap",
  description: "Pick a random film from TMDB based on your filters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${zen_dots.variable} ${roboto.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
