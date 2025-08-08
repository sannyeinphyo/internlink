"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { styled, useTheme } from "@mui/material/styles";
import AdminProfileMenu from "./AdminProfileMenu";
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

import AddBoxIcon from "@mui/icons-material/AddBox";
import BusinessIcon from "@mui/icons-material/Business";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import WorkIcon from "@mui/icons-material/Work";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

const drawerWidth = 260;

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

export default function AdminSideBar({ children }) {
  const { locale } = useParams();
  const theme = useTheme();
  const t = useTranslations("admin_sidebar");
  const [open, setOpen] = React.useState(true);
  const pathname = usePathname();

  const navItems = [
    { text: t("dashboard"), icon: <Home />, path: `/${locale}/admin/dashboard` },
    { text: t("create_accounts"), icon: <AddBoxIcon />, path: `/${locale}/admin/create` },
    { text: t("manage_students"), icon: <People />, path: `/${locale}/admin/student` },
    { text: t("manage_companies"), icon: <BusinessIcon />, path: `/${locale}/admin/company` },
    { text: t("manage_universities"), icon: <HomeWorkIcon />, path: `/${locale}/admin/university` },
    { text: t("manage_teachers"), icon: <SupervisorAccountIcon />, path: `/${locale}/admin/teacher` },
    { text: t("internship_applications"), icon: <WorkIcon />, path: `/${locale}/admin/internshipapplication` },
    { text: t("review_accounts"), icon: <AddBoxIcon />, path: `/${locale}/admin/reviewaccount` },
    { text: t("feedback"), icon: <ChatBubbleIcon />, path: `/${locale}/admin/feedback` },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} >
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
            <Typography variant="h6" noWrap color="#ea9635ff" fontWeight={"bold"}>
              UniJob
              <span
                style={{
                  fontWeight: "bold",
                  color: "#8e38ffff",
                }}
              >
                Link
              </span>
            </Typography>
          </Box>

          <AdminProfileMenu />
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
                <ListItem disablePadding >
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
                      slotProps={{
    primary: {
      sx: {
        fontSize: "0.8rem",
        fontWeight: isActive ? "bold" : "normal",
      },
    },
  }}
                      sx={{
                        fontSize: "0.8rem",
                        
                        opacity: open ? 1 : 0,
                       
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          width: `calc(100% - ${open ? drawerWidth : 56}px)`,
          overflowX: "auto",
        }}
      >
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
