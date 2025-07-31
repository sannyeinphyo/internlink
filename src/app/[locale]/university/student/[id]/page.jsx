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
  Avatar,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SchoolIcon from "@mui/icons-material/School";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UniversityStudentDetailPage({ params }) {
  const { id, locale } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const SKILL_COLORS = [
    "#1976d2", // Blue
    "#388e3c", // Green
    "#d32f2f", // Red
    "#f57c00", // Orange
    "#7b1fa2", // Purple
    "#0097a7", // Teal
    "#fbc02d", // Yellow
  ];

  function getColorByIndex(index) {
    return SKILL_COLORS[index % SKILL_COLORS.length];
  }

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!id || status === "loading") return;

      if (
        status === "unauthenticated" ||
        session?.user?.role !== "university" ||
        !session?.user?.id
      ) {
        setError("You are not authorized to view this student's details.");
        setLoading(false);
        toast.error("You are not authorized to view this student's details.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/university/student/${id}`, {
          withCredentials: true,
        });
        if (response.data && response.data.data) {
          setStudentData(response.data.data);
        } else {
          setError("Student data not found in response.");
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load student details. Please try again or check the ID."
        );
        toast.error(
          err.response?.data?.message || "Failed to load student details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, session, status]);

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

  const {
    name,
    email,
    image,
    status: userStatus,
    verified,
    student,
  } = studentData;

  return (
    <Box sx={{ p: 4 }}>
      <ToastContainer />
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
          <Avatar
            src={image || ""}
            sx={{ width: 80, height: 80, mr: 3, bgcolor: "secondary.main" }}
          >
            {image ? null : name ? (
              name[0].toUpperCase()
            ) : (
              <SchoolIcon sx={{ fontSize: 40 }} />
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
            <strong>Account Status:</strong>{" "}
            <Box
              component="span"
              sx={{
                color:
                  userStatus === "pending"
                    ? "orange"
                    : userStatus === "approved"
                    ? "green"
                    : userStatus === "declined"
                    ? "red"
                    : "inherit",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {userStatus}
            </Box>
          </Typography>
          <Typography variant="body1">
            <strong>Account Verified:</strong> {verified ? "Yes" : "No"}
          </Typography>

          {student && (
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
                      student.skills && student.skills.length > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          {(typeof student.skills === "string"
                            ? student.skills.split(",").map((s) => s.trim())
                            : student.skills
                          )
                            .filter(Boolean)
                            .map((skill, idx) => (
                              <Chip
                                key={idx}
                                label={skill}
                                size="small"
                                sx={{
                                  backgroundColor: getColorByIndex(idx),
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                        </Box>
                      ) : (
                        "N/A"
                      )
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
                      student.Github ? (
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
                <ListItem disableGutters>
                  <ListItemText
                    primary="Facebook"
                    secondary={
                      student.facebook ? (
                        <a
                          href={student.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {student.facebook}
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
