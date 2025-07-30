"use client";

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";

import { useSession } from "next-auth/react";
import Logout from "@/components/Logout";
import axios from "axios";
import NotificationBell from "@/components/NotificationBell";

export const appBarHeight = 64;

export default function Navbar() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState("");
  const [name, setName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const userId = session?.user?.id;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    if (session?.user) {
      console.log("User session exists:", session.user);
      if (session.user.name) {
        console.log("Setting name from session.user.name:", session.user.name);
        setName(session.user.name);
      } else {
        console.log("Fetching company profile because name not in session...");
        axios
          .get("/api/teacher/profile")
          .then((res) => {
            console.log("Teacher profile response:", res.data);
            setName(res.data.name || "Teacher");
          })
          .catch((error) => {
            console.error("Failed to fetch teacher profile:", error);
            setName("Teacher");
          });
      }
    } else {
      console.log("No user session found");
    }
  }, [session]);

  useEffect(() => {
    const getProfile = async () => {
      const req = await axios.get(`/api/user/image`);
      setProfile(req.data.user);
    };
    getProfile();
  }, []);

  if (status === "loading") {
    console.log("Session is loading...");
    return (
      <AppBar position="fixed" sx={{ height: appBarHeight, px: 2 }}>
        <Toolbar sx={{ minHeight: appBarHeight }}>
          <CircularProgress color="inherit" size={24} />
        </Toolbar>
      </AppBar>
    );
  }

  if (!session) {
    console.log("User is not logged in");
    return (
      <AppBar position="fixed" sx={{ height: appBarHeight, px: 2 }}>
        <Toolbar sx={{ minHeight: appBarHeight }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Intern
            <span style={{ fontStyle: "italic" }}>Link</span>
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        height: appBarHeight,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        px: 2,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "#d7daffff", 
        color: "black",
        boxShadow:"none",
      }}
    >
      <Toolbar
        sx={{
          minHeight: appBarHeight,
          px: 0,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Intern<span style={{ fontStyle: "italic" }}>Link</span>
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          {session?.user?.id && <NotificationBell userId={session.user.id} />}
          <Typography>{name}</Typography>
          <Tooltip title="Company Profile">
            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              size="large"
              sx={{ display: "flex", gap: 1 }}
            >
              <Avatar src={profile.image} alt={name} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem>
              <Logout />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
