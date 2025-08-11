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
import axios from "axios";
import NotificationBell from "@/components/NotificationBell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoutButton from "@/components/Logout";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export const appBarHeight = 64;

export default function Navbar() {
  const t = useTranslations("NavBar");
  const { locale } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState("");
  const [name, setName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const userId = session?.user?.id;
  const handleToggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  // useEffect(() => {
  //   if (session?.user) {
  //     console.log("User session exists:", session.user);
  //     if (session.user.name) {
  //       console.log("Setting name from session.user.name:", session.user.name);
  //       setName(session.user.name);
  //     } else {
  //       console.log("Fetching company profile because name not in session...");
  //       axios
  //         .get("/api/company/profile")
  //         .then((res) => {
  //           console.log("Company profile response:", res.data);
  //           setName(res.data.data || "Company");
  //         })
  //         .catch((error) => {
  //           console.error("Failed to fetch company profile:", error);
  //           setName("Company");
  //         });
  //     }
  //   } else {
  //     console.log("No user session found");
  //   }
  // }, [session]);
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

  console.log("Getting Profile", profile);

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
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#ea9635ff" }}
          >
            UniJob
          </Typography>

          <span style={{ fontStyle: "italic", color: "purple" }}>Link</span>
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
        backgroundColor: "#e8ffe9ff",
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
        <Box>
          <Typography
            component={"span"}
            variant="h6"
            sx={{ fontWeight: "bold", color: "#ea9635ff" }}
          >
            UniJob
          </Typography>
          <Typography
            variant="h6"
            fontWeight={"bold"}
            color="#8e38ffff"
            component={"span"}
          >
            Link
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          {session?.user?.id && <NotificationBell userId={session.user.id} />}

          <Tooltip title="Company Profile">
            {/* <IconButton
            onClick={handleToggle}
            color="inherit"
            size="medium"
            sx={{ display: "flex", gap: 1, boxShadow: 2 }}
          >
            <Avatar src={profile.image} alt={name} />
          </IconButton> */}
            <Box
              onClick={handleToggle}
              sx={{ cursor: "pointer" }}
              alignItems={"center"}
            >
              <img
                style={{
                  borderRadius: "8px",
                  width: "48px",
                  boxShadow: "0px 0 4px 2px rgba(0,0,0,0.1)",
                }}
                alt={profile.name}
                src={
                  profile.image || "/default-avatar.jpg" || profile.user.image
                }
              />
            </Box>
          </Tooltip>

          <Menu
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
            <MenuItem>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "bgmain.main",
                }}
              >
                {profile.name}
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                router.push(`/${locale}/company/settings/profile`);
              }}
              sx={{
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                },
                borderRadius: 1,
                mt: 1,
              }}
            >
              <Typography variant="body2">{t("Profile")}</Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleClose();
                router.push(`/${locale}/company/settings/reset_password`);
              }}
              sx={{
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                },
                borderRadius: 1,
                mt: 1,
              }}
            >
              <Typography variant="body2">{t("ChangePassword")}</Typography>
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem disableRipple>
              <LanguageSwitcher />
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem disableRipple sx={{ mt: 1 }}>
              <LogoutButton onClick={handleClose} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
