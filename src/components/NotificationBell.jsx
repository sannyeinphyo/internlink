"use client";

import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);


export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      toast.error("Error loading notifications");
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) =>
            fetch("/api/notifications/read", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: n.id }),
            })
          )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 400, overflowY: "auto", p: 0 },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 && (
          <MenuItem disabled sx={{ justifyContent: "center" }}>
            No notifications
          </MenuItem>
        )}

        {notifications.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => {
              markAsRead(n.id);
              handleClose();
            }}
            sx={{
              alignItems: "flex-start",
              bgcolor: n.read ? "background.paper" : "rgba(25, 118, 210, 0.1)",
              borderLeft: n.read ? "none" : "4px solid #1976d2",
              py: 1,
              px: 2,
              cursor: "pointer",
              whiteSpace: "normal",
              "&:hover": { bgcolor: "primary.light", color: "white" },
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {n.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {n.body}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ mt: 0.5 }}
              >
                {dayjs(n.createdAt).fromNow()}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
