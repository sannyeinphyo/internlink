"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from "@mui/material";

export default function AdminMailboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let didCancel = false;

    axios
      .get("/api/mailbox")
      .then((res) => {
        if (!didCancel) {
          setMessages(res.data);
          setError("");
          toast.success("Messages loaded successfully");
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Failed to fetch messages.";
        if (!didCancel) {
          setError(msg);
          toast.error(msg);
        }
      })
      .finally(() => {
        if (!didCancel) setLoading(false);
      });

    return () => {
      didCancel = true;
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={4} px={2}>
      <Typography variant="h4" gutterBottom>
        Mailbox Messages
      </Typography>

      {messages.length === 0 ? (
        <Typography color="text.secondary" mt={2}>
          No messages found.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <List>
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {msg.user?.name || msg.name || "Anonymous"} —{" "}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {isClient
                            ? new Date(msg.createdAt).toLocaleString()
                            : ""}
                        </Typography>
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mb: 0.5 }}
                        >
                          {msg.email}
                        </Typography>
                        <Typography variant="body2">{msg.message}</Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
