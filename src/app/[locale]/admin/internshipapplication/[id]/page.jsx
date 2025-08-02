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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

export default function InternshipApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchApplicationDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/admin/internshipapplication/${id}`);
        if (response.data?.data) {
          setApplicationData(response.data.data);
        } else {
          setError("Internship application data not found in response.");
        }
      } catch (err) {
        console.error("Error fetching internship application details:", err);
        setError("Failed to load internship application details. Please try again or check the ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // Loading state
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
          Loading application details...
        </Typography>
      </Box>
    );
  }

  // Error state
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

  // No application data found
  if (!applicationData) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Typography variant="h6">Internship application not found.</Typography>
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

  const { status, applied_at, post, student } = applicationData;

  return (
    <Box sx={{ p: 4 }}>
      {/* Header with Back Button */}
      <Stack direction="row" alignItems="center" mb={4}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          Internship Application Details
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: "auto", borderRadius: 2 }}>
        {/* Application Status & Applied Date */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Application Status & Date
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Chip
            label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            color={getStatusColor(status)}
            variant="filled"
          />
          <Typography variant="body1">
            <strong>Applied At:</strong> {applied_at}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Student Details Section */}
        {student?.user ? (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Applicant Details
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={student.user.image || ""}
                sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}
              >
                {!student.user.image && (
                  student.user.name
                    ? student.user.name[0].toUpperCase()
                    : <PersonIcon />
                )}
              </Avatar>
              <Box>
                <Typography variant="h6">{student.user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.user.email}
                </Typography>
              </Box>
            </Box>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Role" secondary="Student" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Verified"
                  secondary={student.user.verified ? "Yes" : "No"}
                />
              </ListItem>
              {student.university && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="University"
                    secondary={student.university.name || "N/A"}
                  />
                </ListItem>
              )}
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
                    typeof student.skills === "string" && student.skills.length > 0
                      ? student.skills
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .join(", ")
                      : "N/A"
                  }
                />
              </ListItem>
              {student.linkedIn && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="LinkedIn"
                    secondary={
                      <a href={student.linkedIn} target="_blank" rel="noopener noreferrer">
                        {student.linkedIn}
                      </a>
                    }
                  />
                </ListItem>
              )}
              {student.Github && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="GitHub"
                    secondary={
                      <a href={student.Github} target="_blank" rel="noopener noreferrer">
                        {student.Github}
                      </a>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Box>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            Student details not available for this application.
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Company Details Section */}
        {post?.company ? (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Company Details
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={post.company.image || ""}
                sx={{ width: 60, height: 60, mr: 2, bgcolor: "secondary.main" }}
              >
                {!post.company.image && (
                  post.company.name
                    ? post.company.name[0].toUpperCase()
                    : <BusinessIcon />
                )}
              </Avatar>
              <Box>
                <Typography variant="h6">{post.company.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.company.contact_info}
                </Typography>
              </Box>
            </Box>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Location" secondary={post.company.location || "N/A"} />
              </ListItem>
              {post.company.website && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="Website"
                    secondary={
                      <a href={post.company.website} target="_blank" rel="noopener noreferrer">
                        {post.company.website}
                      </a>
                    }
                  />
                </ListItem>
              )}
              {post.company.facebook && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="Facebook"
                    secondary={
                      <a href={post.company.facebook} target="_blank" rel="noopener noreferrer">
                        {post.company.facebook}
                      </a>
                    }
                  />
                </ListItem>
              )}
              <ListItem disableGutters>
                <ListItemText primary="Description" secondary={post.company.description || "N/A"} />
              </ListItem>
            </List>
          </Box>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            Company details not available for this post.
          </Alert>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Internship Post Details */}
        {post ? (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Internship Post Details
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Post Title" secondary={post.title || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Description" secondary={post.description || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Requirements" secondary={post.requirements || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Responsibilities" secondary={post.responsibilities || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Benefits" secondary={post.benefits || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Application Deadline"
                  secondary={post.application_deadline || "N/A"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Created At" secondary={post.createdAt || "N/A"} />
              </ListItem>
            </List>
          </Box>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            Internship post details not available for this application.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
