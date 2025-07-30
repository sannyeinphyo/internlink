"use client";

import React from "react";

import { Box } from "@mui/material";

export default function SettingsLayout({ children }) {
  return (
    <Box>
      <Box flex={1}>{children}</Box>
    </Box>
  );
}
