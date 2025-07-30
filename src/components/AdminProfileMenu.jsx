"use client";

import React from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

export default function AdminProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const pathname = usePathname();

  const admin = {
    name: "Admin",
    avatar: "/admin.jpg",
  };

  const handleToggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const goTo = (path) => {
    handleClose();
    router.push(path);
  };

  const handleLogout = () => {
    handleClose();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.push("/admin/login");
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleToggle(e);
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        userSelect: "none",
        px: 2,
        py: 1,
        borderRadius: 2,
        backgroundColor: "white",
        transition: "background-color 0.3s",
        "&:hover": {
          backgroundColor: "primary",
        },
      }}
      aria-haspopup="true"
      aria-expanded={open ? "true" : undefined}
      aria-controls={open ? "admin-profile-menu" : undefined}
    >
      <Typography variant="body1" sx={{ fontWeight: 500, color: "black" }}>
        {admin.name}
      </Typography>

      <Avatar
        alt={admin.name}
        src={admin.avatar}
        sx={{
          width: 32,
          height: 32,
          pointerEvents: "none",
        }}
      />

      <Menu
        id="admin-profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          },
        }}
      >
        <MenuItem
          onClick={() => goTo("/admin/profile")}
          sx={{
            "&:hover": {
              backgroundColor: "primary",
            },
          }}
        >
          Profile
        </MenuItem>

        <MenuItem
          onClick={() => goTo("/admin/change-password")}
          sx={{
            backgroundColor:
              pathname === "/admin/change-password" ? "#b983ff" : "none",
            color: pathname === "/admin/change-password" ? "white" : "black",
            "&:hover": {
              backgroundColor:
                pathname === "/admin/change-password" ? "#a371f7" : "#f9f9f9",
            },
          }}
        >
          Change Password
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            "&:hover": {
              backgroundColor: "#ffebee",
            },
          }}
        >
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
