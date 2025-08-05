"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import LogoutButton from "@/components/Logout";
import axios from "axios";
import { useParams } from "next/navigation";
import LanguageSwitcher from "../LanguageSwitcher";

export default function AdminProfileMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/profile");
        setAdmin(res.data.admin || {});
      } catch (err) {
        console.error("Failed to fetch admin info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
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
        py: 1,
        borderRadius: "999px",
        backgroundColor: "white",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
        transition: "background-color 0.3s, transform 0.2s",
        "&:hover": {
          backgroundColor: "#f0f0ff",
          transform: "scale(1.02)",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={24} />
      ) : admin ? (
        <>
          <Avatar
            alt={admin.name}
            src={admin.image || "/default-avatar.png"}
            sx={{
              width: 32,
              height: 32,
              border: "2px solid #b983ff",
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#333",
              maxWidth: 120,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {admin.name}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="error">
          Error
        </Typography>
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
            minWidth: 200,
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            p: 1,
          },
        }}
      >
        {[
          {
            label: "Profile",
            path: `/${locale}/admin/profile`,
          },
          {
            label: "Change Password",
            path: `/${locale}/reset_password`,
          },
        ].map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => {
              handleClose();
              goTo(item.path);
            }}
            sx={{
              fontWeight: pathname === item.path ? 600 : 400,
              color: pathname === item.path ? "primary.main" : "text.primary",
              borderRadius: 1,
              mt: 1,
              "&:hover": {
                bgcolor: "primary.light",
                color: "white",
              },
            }}
          >
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}

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
