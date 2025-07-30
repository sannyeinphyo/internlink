"use client";
import React from "react";
import { Button } from "@mui/material";
export function ButtonPrimary({ children, disabled, ...props }) {
  return (
    <Button
      {...props}
      disabled={disabled}
      variant="contained"
      sx={{
        borderRadius: 2,
        textTransform: "none",
        bgcolor: "buttonmain.main",
        boxShadow: "0 2px 8px rgba(107, 56, 194, 0.5)",
        minWidth: "150px",
        minHeight: "40px",
        "&:hover": {
          backgroundColor: "buttonmain_hover.main",
          boxShadow: "0 2px 10px rgba(107, 56, 194, 0.7)",
        },
        "&.Mui-disabled": {
          bgcolor: "grey.400",
          color: "white",
          boxShadow: "none",
        },
      }}
    >
      {children}
    </Button>
  );
}

export function ButtonOutline({ children, ...props }) {
  return (
    <Button
      {...props}
      variant="outlined"
      sx={{
        boxShadow: "0 2px 8px rgba(107, 56, 194, 0.5)",
        textTransform: "none",
        borderRadius: 2,
        borderColor: "buttonmain.main",
        color: "buttonmain.main",
        borderWidth: 2,
        backdropFilter: "blur(10px)",
        "&:hover": {
          borderColor: "buttonmain_hover.main",
          color: "buttonmain_hover.main",
          boxShadow: "0 2px 10px rgba(107, 56, 194, 0.7)",
        },
        minWidth: "150px",
        minHeight: "40px",
      }}
    >
      {children}
    </Button>
  );
}
