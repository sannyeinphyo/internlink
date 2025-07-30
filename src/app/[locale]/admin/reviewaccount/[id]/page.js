"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
} from "@mui/material";
import { Business, School, Person, ArrowBack } from "@mui/icons-material";

const getStatusChipColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "declined":
      return "error";
    default:
      return "default";
  }
};
import { useParams } from "next/navigation";

export default function UserDetailsPage() {
  const { id: userId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${baseUrl}/api/admin/reviewaccount/${userId}`);
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, baseUrl]);

  const handleStatusUpdate = async (newStatus) => {
    setProcessing(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      await axios.patch(`${baseUrl}/api/admin/reviewaccount/${userId}`, { status: newStatus });
      setUser((prev) => ({
        ...prev,
        status: newStatus,
        verified: newStatus === "approved",
      }));
      setSnackbar({
        open: true,
        message: `Account successfully ${newStatus === "approved" ? "approved" : "declined"}!`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || err.message || "An unknown error occurred",
        severity: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const closeSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  if (loading)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}
      >
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Loading user details...
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 3, textAlign: "center", mt: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body1" color="text.secondary" mt={2}>
          There was an issue loading the user information.
        </Typography>
      </Box>
    );

  if (!user)
    return (
      <Box sx={{ p: 3, textAlign: "center", mt: 5 }}>
        <Typography variant="h5" color="error">
          User not found.
        </Typography>
        <Typography>The requested user does not exist or could not be loaded.</Typography>
      </Box>
    );

  const { name, email, image, role, status, company, student } = user;
  const isPending = status === "pending";

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.back()} disabled={processing}>
          Back
        </Button>
        {isPending && (
          <Box>
            <Button
              variant="contained"
              color="success"
              sx={{ mr: 2 }}
              onClick={() => handleStatusUpdate("approved")}
              disabled={processing}
            >
              {processing ? <CircularProgress size={24} color="inherit" /> : "Approve"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleStatusUpdate("declined")}
              disabled={processing}
            >
              {processing ? <CircularProgress size={24} color="inherit" /> : "Reject"}
            </Button>
          </Box>
        )}
        {!isPending && (
          <Chip
            label={`Account ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            color={getStatusChipColor(status)}
            variant="filled"
            sx={{ ml: "auto" }}
          />
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar src={image || ""} sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}>
            {!image && (name ? name[0].toUpperCase() : <Person sx={{ fontSize: 40 }} />)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mt={0.5}>
              {email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Chip
            icon={role === "company" ? <Business /> : <School />}
            label={`Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            color={getStatusChipColor(status)}
            variant="filled"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {role === "company" && company && (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Company Profile
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Company Name" secondary={company.name || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Location" secondary={company.location || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Contact Info" secondary={company.contact_info || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Website"
                  secondary={
                    company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        {company.website}
                      </a>
                    ) : (
                      "N/A"
                    )
                  }
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Description" secondary={company.description || "N/A"} />
              </ListItem>
            </List>
          </Box>
        )}

        {role === "student" && student && (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Student Profile
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="University" secondary={student.university?.name || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Major" secondary={student.major || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Batch Year" secondary={student.batch_year || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Skills"
                  secondary={
                    student.skills && typeof student.skills === "string" && student.skills.length > 0
                      ? student.skills
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .join(", ")
                      : "N/A"
                  }
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="LinkedIn"
                  secondary={
                    student.linkedIn ? (
                      <a href={student.linkedIn} target="_blank" rel="noopener noreferrer">
                        {student.linkedIn}
                      </a>
                    ) : (
                      "N/A"
                    )
                  }
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="GitHub"
                  secondary={
                    student.Github ? (
                      <a href={student.Github} target="_blank" rel="noopener noreferrer">
                        {student.Github}
                      </a>
                    ) : (
                      "N/A"
                    )
                  }
                />
              </ListItem>
            </List>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
