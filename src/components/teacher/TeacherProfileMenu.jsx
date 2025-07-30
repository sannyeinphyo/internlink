"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { useRouter, usePathname, useParams } from "next/navigation";
import LogoutButton from "@/components/Logout";
import axios from "axios";
import LanguageSwitcher from "../LanguageSwitcher";
export default function AdminProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const pathname = usePathname();
  const [teacher, setTeacher] = useState();
  const { locale } = useParams();

  useEffect(() => {
    try {
      const fetchAdmin = async () => {
        const req = await axios.get(`/api/teacher/profile`);
        setTeacher(req.data.teacher || []);
      };
      fetchAdmin();
    } catch (err) {
      console.log("Getting teacher information", err);
    }
  }, []);
  console.log("Teacher Info", teacher);

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
      {teacher && teacher.user && (
        <>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "black" }}>
            {teacher.user.name}
          </Typography>

          <Avatar
            alt={teacher.user.name}
            src={teacher.user.image || "/default-avatar.png"}
            sx={{
              width: 32,
              height: 32,
              pointerEvents: "none",
            }}
          />
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
            path: `/${locale}/teacher/profile`,
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
