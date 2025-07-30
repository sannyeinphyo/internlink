// src/app/admin/teacher/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Avatar, // Import Avatar for displaying images/initials
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PersonIcon from "@mui/icons-material/Person"; // Generic person icon for avatar fallback
import SchoolIcon from "@mui/icons-material/School"; // Icon for university

export default function TeacherDetailPage() {
  const { id } = useParams(); // Get the ID from the URL
  const router = useRouter(); // Initialize useRouter for navigation

  const [teacherData, setTeacherData] = useState(null); // Renamed to teacherData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/admin/teacher/${id}`);
        if (response.data && response.data.data) {
          setTeacherData(response.data.data); // Set the full user object with nested teacher data
        } else {
          setError("Teacher data not found in response.");
        }
      } catch (err) {
        console.error("Error fetching teacher details:", err);
        setError(
          "Failed to load teacher details. Please try again or check the ID."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Loading teacher details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  if (!teacherData) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Typography variant="h6">Teacher not found.</Typography>
        <Button
          variant="contained"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  // Destructure relevant fields from the user object and the nested teacher object
  const { name, email, image, status, verified, teacher } = teacherData;

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" mb={4}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          Teacher Details
        </Typography>
      </Stack>

      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 800, mx: "auto", borderRadius: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          {/* Avatar for teacher image or initial */}
          <Avatar
            src={image || ""} // Use the 'image' field from the User model
            sx={{ width: 80, height: 80, mr: 3, bgcolor: "success.main" }} // Changed color for distinction
          >
            {image ? null : name ? (
              name[0].toUpperCase() // Fallback to first letter of name
            ) : (
              <PersonIcon sx={{ fontSize: 40 }} /> // Fallback to a generic person icon
            )}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {name}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
          <Typography variant="body1">
            <strong>Status:</strong>{" "}
            <Box
              component="span"
              sx={{
                color:
                  status === "pending"
                    ? "orange"
                    : status === "approved"
                    ? "green"
                    : status === "declined"
                    ? "red"
                    : "inherit",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {status}
            </Box>
          </Typography>
          <Typography variant="body1">
            <strong>Verified:</strong> {verified ? "Yes" : "No"}
          </Typography>

          {teacher && ( // Only show teacher specific details if teacher data exists
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Teacher Specifics:
              </Typography>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Department"
                    secondary={teacher.department || "N/A"}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="University"
                    secondary={teacher.university?.name || "N/A"}
                  />
                </ListItem>
              </List>
            </>
          )}
          {!teacher && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No detailed teacher profile found for this user.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
