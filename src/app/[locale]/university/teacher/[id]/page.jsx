// src/app/[locale]/university/teacher/[id]/page.jsx
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
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SchoolIcon from "@mui/icons-material/School"; // Or a teacher-specific icon if you have one
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UniversityTeacherDetailPage() {
  const { id , locale } = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!id || sessionStatus === "loading") return;

      if (
        sessionStatus === "unauthenticated" ||
        session?.user?.role !== "university" ||
        !session?.user?.id
      ) {
        setError("You are not authorized to view this teacher's details.");
        setLoading(false);
        toast.error("You are not authorized to view this teacher's details.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/university/teacher/${id}`);
        if (response.data && response.data.data) {
          setTeacherData(response.data.data);
        } else {
          setError("Teacher data not found in response.");
        }
      } catch (err) {
        console.error("Error fetching teacher details:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load teacher details. Please try again or check the ID."
        );
        toast.error(
          err.response?.data?.message || "Failed to load teacher details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id, session, sessionStatus]);
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
          onClick={() => router.push(`/${locale}/university/teacher`)} // Go back to list
          startIcon={<KeyboardBackspaceIcon />}
          sx={{ mt: 3 }}
        >
          Back to Teacher List
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
          onClick={() => router.push(`/${locale}/university/teacher`)}
          startIcon={<KeyboardBackspaceIcon />}
          sx={{ mt: 3 }}
        >
          Back to Teacher List
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
    teacher, 
  } = teacherData;

  return (
    <Box sx={{ p: 4 }}>
      <ToastContainer />
      <Stack direction="row" alignItems="center" mb={4}>
        <Button
          variant="outlined"
          onClick={() => router.push(`/${locale}/university/teacher`)} // Go back to list
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
          <Avatar
            src={image || ""}
            sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}
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

          {teacher && ( // Display teacher-specific details only if 'teacher' object exists
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Teacher Specifics:
              </Typography>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="University"
                    secondary={teacher.university?.name || "N/A"}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Department"
                    secondary={teacher.department || "N/A"}
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
