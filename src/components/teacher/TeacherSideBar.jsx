"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { styled, useTheme } from "@mui/material/styles";
import TeacherProfileMenu from "./TeacherProfileMenu";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  CssBaseline,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home,
  People,
} from "@mui/icons-material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PostAddIcon from "@mui/icons-material/PostAdd";
import WorkIcon from "@mui/icons-material/Work";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 280;

const openedMixin = (theme) => ({
  width: drawerWidth,
  backgroundColor: "#ffffff",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  backgroundColor: "#ffffff",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ open }) => ({
  zIndex: 1300,
  backgroundColor: "#e7f3ffff",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  color: "black",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
    color: "black",
  }),
}));

export default function TeacherSideBar({ children }) {
  const { locale } = useParams();
  const theme = useTheme();
  const t = useTranslations("teacher-nav");
  const [open, setOpen] = React.useState(true);
  const pathname = usePathname();
  const navItems = [
    {
      text: t("dashboard"),
      path: `/${locale}/teacher/dashboard`,
      icon: <DashboardIcon />,
    },
    {
      text: t("student"),
      path: `/${locale}/teacher/view_student`,
      icon: <PostAddIcon />,
    },
    {
      text: t("generate_report"),
      path: `/${locale}/teacher/report`,
      icon: <WorkIcon />,
    },
    {
      text: t("applications"),
      path: `/${locale}/teacher/student_applications`,
      icon: <DescriptionIcon />,
    },
    {
      text: t("settings"),
      path: `/${locale}/teacher/settings`,
      icon: <SettingsIcon />,
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => setOpen(true)}
              color="black"
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              color="#ea9635ff"
              fontWeight={"bold"}
            >
              UniJob
              <span style={{ fontWeight: "bold", color: "#8e38ffff" }}>
                Link
              </span>
            </Typography>
          </Box>

          <TeacherProfileMenu />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {navItems.map(({ text, icon, path }) => {
            const isActive = pathname === path;
            return (
              <Link key={text} href={path} style={{ textDecoration: "none" }}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      my: 0.5,
                      backgroundColor: isActive ? "#b983ff" : "transparent",
                      color: isActive ? "white" : "black",
                      "&:hover": {
                        backgroundColor: isActive ? "#aa76ec" : "#f0f0f0",
                        color: isActive ? "white" : "black",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                        color: isActive ? "white" : "inherit",
                      }}
                    >
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      slotProps={{ primary: { sx: {fontSize: "14px"} } }}
                      sx={{
                        opacity: open ? 1 : 0,
                        fontWeight: isActive ? "bold" : "normal",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
