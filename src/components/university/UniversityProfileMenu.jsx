"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Switch,
  styled,
} from "@mui/material";
import { useRouter, usePathname, useParams } from "next/navigation";
import LogoutButton from "@/components/Logout";
import axios from "axios";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";

export default function AdminProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const [university, setUniversity] = useState();
  const { locale } = useParams();

  useEffect(() => {
    try {
      const fetchAdmin = async () => {
        const req = await axios.get(`/api/university/profile`);
        setUniversity(req.data.university || []);
      };
      fetchAdmin();
    } catch (err) {
      console.log("Getting university information", err);
    }
  }, []);

  const handleToggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const goTo = (path) => {
    handleClose();
    router.push(path);
  };
  return (
    <Box
      onClick={handleToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        userSelect: "none",
        px: 1.5,
        py: 0.8,
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
      {university && university.user && (
        <>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "black" }}>
            {university.user.name}
          </Typography>
          <Box width={32} height={32}>
            <img
              alt={university.user.name}
              src={university.user.image || "/default-avatar.png"}
              sx={{
                width: 32,
                height: 32,
                pointerEvents: "none",
              }}
            />
          </Box>
        </>
      )}

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
            p: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            goTo(`/${locale}/university/profile`);
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
          <Typography variant="body2">Profile</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            goTo(`/${locale}/reset_password`);
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
          <Typography variant="body2">Change Password</Typography>
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
  );
}
