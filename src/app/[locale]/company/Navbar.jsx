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
  Divider,
} from "@mui/material";

import { useSession } from "next-auth/react";
import Logout from "@/components/Logout";
import axios from "axios";
import NotificationBell from "@/components/NotificationBell";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
          .get("/api/company/profile")
          .then((res) => {
            console.log("Company profile response:", res.data);
            setName(res.data.name || "Company");
          })
          .catch((error) => {
            console.error("Failed to fetch company profile:", error);
            setName("Company");
          });
      }
    } else {
      console.log("No user session found");
    }
  }, [session]);
useEffect(() => {
  const getProfile = async () => {
    try {
      const req = await axios.get(`/api/company/profile`);
      setProfile(req.data.data);
    } catch (err) {
      console.error("Failed to load company profile", err);
    }
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
            <span style={{ fontStyle: "italic", color: "purple" }}>Link</span>
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
        backgroundColor: "#ffffff",
        color: "black",
        boxShadow: 2,
        backdropFilter: "blur(10px)",
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
          Intern
          <span style={{ fontStyle: "italic", color: "buttonmain.main" }}>Link</span>
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          {session?.user?.id && <NotificationBell userId={session.user.id} />}
          <Typography
            sx={{ fontSize: "16px", fontWeight: "bold", color: "bgmain.main" , }}
          >
            {name}
          </Typography>
          <Tooltip title="Company Profile">
            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              size="medium"
              sx={{ display: "flex", gap: 1 , boxShadow:2 }}
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
            <Divider/>
            <LanguageSwitcher/>
            <MenuItem>
              <Logout onClick={handleMenuClose} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
