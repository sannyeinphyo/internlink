"use client";
import React from "react";
import Link from "next/link";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Box,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PostAddIcon from "@mui/icons-material/PostAdd";
import WorkIcon from "@mui/icons-material/Work";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useParams, usePathname } from "next/navigation";
import { appBarHeight } from "./Navbar";

const drawerWidth = 240;
const collapsedWidth = 60;

export default function Sidebar() {
  const [open, setOpen] = React.useState(false);
  const { locale } = useParams();
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: `/${locale}/company/dashboard`, icon: <DashboardIcon /> },
    { label: "Post Internship", href: `/${locale}/company/post-internship`, icon: <PostAddIcon /> },
    { label: "Internship Posts", href: `/${locale}/company/my-internship`, icon: <WorkIcon /> },
    { label: "My Applications", href: `/${locale}/company/my-applications`, icon: <DescriptionIcon /> },
    { label: "Company Settings", href: `/${locale}/company/settings`, icon: <SettingsIcon /> },
  ];

  const normalizePath = (path) => path.replace(/\/$/, "");

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      PaperProps={{
        sx: {
          backgroundColor: "#fff",
          color: "#1a1a1a",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          border: "none",
        },
      }}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        top: appBarHeight,
        height: `calc(100vh - ${appBarHeight}px)`,
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        overflowX: "hidden",
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: "border-box",
          height: `calc(100vh - ${appBarHeight}px)`,
          overflowX: "hidden",
          top: appBarHeight,
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),

        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => {
            const isActive = normalizePath(item.href) === normalizePath(pathname);
            return (
              <Tooltip key={item.href} title={!open ? item.label : ""} placement="right" arrow>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    justifyContent: open ? "initial" : "center",
                    px: 3,
                    mb: 0.8,
                 
                    color: isActive ? "#651edf" : "#333",
                    backgroundColor: isActive ? "rgba(101, 30, 223, 0.12)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: isActive ? "rgba(101, 30, 223, 0.18)" : "rgba(101, 30, 223, 0.08)",
                      color: "#651edf",
                      "& svg": {
                        color: "#651edf",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: isActive ? "#651edf" : "#666",
                      fontSize: "1.5rem",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
