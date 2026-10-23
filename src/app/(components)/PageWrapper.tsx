"use client";
import React from "react";
import {
  Typography,
  Alert,
  Container,
  Box,
  useMediaQuery,
} from "@mui/material";
import theme from "../theme";

interface PageWrapperProps {
  title: string;
  subTitle?: boolean;
  alertMessage?: string;
  children: React.ReactNode;
}

export default function PageWrapper({
  title,
  subTitle,
  alertMessage,
  children,
}: PageWrapperProps) {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const content = (
    <>
      <Typography variant="h4" sx={{ mb: subTitle ? 0 : 2 }}>
        {title}
      </Typography>

      {alertMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      {children}
    </>
  );

  const containerProps = {
    sx: { textAlign: "center", mt: 3 },
  };

  return isMobile ? (
    <Box {...containerProps}>{content}</Box>
  ) : (
    <Container {...containerProps}>{content}</Container>
  );
}
