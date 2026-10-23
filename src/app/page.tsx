"use client";
import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import PageWrapper from "./(components)/PageWrapper";
import { get_random_film } from "./service";
import FilmInfos from "./(components)/FilmInfos";
import Filters from "./(components)/(Filters)/Filters";
import { Film } from "./interface";

export default function FilmPicker() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [film, setFilm] = React.useState<Film | null>(null);
  const [filters, setFilters] = React.useState<string>("");

  React.useEffect(() => {
    get_film();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function get_film() {
    setAlertMessage("");
    setLoading(true);
    get_random_film(filters)
      .then((data) => {
        setFilm(data);
      })
      .catch((error) => {
        setAlertMessage(error.message);
      })
      .finally(() => setLoading(false));
  }

  return (
    <PageWrapper title="FILM PICKER" alertMessage={alertMessage}>
      {film && (
        <>
          <Box sx={{ position: "relative" }}>
            <Box sx={{ visibility: loading ? "hidden" : "visible" }}>
              <FilmInfos film={film} />
            </Box>
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
          <Button disabled={loading} variant="outlined" onClick={get_film}>
            Pick
          </Button>
          <Filters setFilters={setFilters}></Filters>
        </>
      )}
    </PageWrapper>
  );
}
