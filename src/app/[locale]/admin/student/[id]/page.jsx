// src/app/admin/student/[id]/page.js
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
import SchoolIcon from "@mui/icons-material/School"; // Icon for default student avatar

export default function StudentDetailPage() {
  const { id } = useParams(); // Get the ID from the URL
  const router = useRouter(); // Initialize useRouter for navigation

  const [studentData, setStudentData] = useState(null); // Renamed to studentData to avoid conflict with 'student' nested object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/admin/student/${id}`);
        if (response.data && response.data.data) {
          setStudentData(response.data.data); // Set the full user object with nested student data
        } else {
          setError("Student data not found in response.");
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(
          "Failed to load student details. Please try again or check the ID."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
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
          Loading student details...
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

  if (!studentData) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Typography variant="h6">Student not found.</Typography>
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

  // Destructure relevant fields from the user object and the nested student object
  const { name, email, image, status, verified, student } = studentData;

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
          Student Details
        </Typography>
      </Stack>

      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 800, mx: "auto", borderRadius: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          {/* Avatar for student image or initial */}
          <Avatar
            src={image || ""} // Use the 'image' field from the User model
            sx={{ width: 80, height: 80, mr: 3, bgcolor: "secondary.main" }}
          >
            {image ? null : name ? (
              name[0].toUpperCase() // Fallback to first letter of name
            ) : (
              <SchoolIcon sx={{ fontSize: 40 }} /> // Fallback to a generic school icon
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

          {student && ( // Only show student specific details if student data exists
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Student Specifics:
              </Typography>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="University"
                    secondary={student.university?.name || "N/A"}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Major"
                    secondary={student.major || "N/A"}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Batch Year"
                    secondary={student.batch_year || "N/A"}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Skills"
                    secondary={
                      student.skills &&
                      typeof student.skills === "string" &&
                      student.skills.length > 0
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
                        <a
                          href={student.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
                      student.Github ? ( // Note: 'Github' with capital 'G' as per your provided schema
                        <a
                          href={student.Github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {student.Github}
                        </a>
                      ) : (
                        "N/A"
                      )
                    }
                  />
                </ListItem>
              </List>
            </>
          )}
          {!student && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No detailed student profile found for this user.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
