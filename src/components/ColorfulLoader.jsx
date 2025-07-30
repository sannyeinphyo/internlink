"use client";
import React from "react";
import { CircularProgress, Box } from "@mui/material";
import { keyframes } from "@emotion/react";

// Smooth continuous hue rotation
const hueRotate = keyframes`
  0%   { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

// Optional spinner rotation
const spin = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export default function ColorfulLoader({
  fullScreen = true,
  size = 60,
  thickness = 4,
  rainbow = true,
  color = "#1976d2",
  duration = 2, // seconds
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: fullScreen ? "100vh" : "auto",
        width: fullScreen ? "100%" : "auto",
        py: fullScreen ? 0 : 4,
      }}
    >
      <Box
        sx={{
          animation: rainbow ? `${hueRotate} ${duration}s linear infinite` : "none",
          display: "inline-block",
          filter: rainbow ? "hue-rotate(0deg)" : "none",
        }}
      >
        <CircularProgress
          size={size}
          thickness={thickness}
          sx={{
            animation: `${spin} ${duration}s linear infinite`,
            color: rainbow ? "#00e5ff" : color,
            borderRadius: "50%",
          }}
        />
      </Box>
    </Box>
  );
}
