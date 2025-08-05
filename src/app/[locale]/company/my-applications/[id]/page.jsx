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
import { useTranslations } from "next-intl";

export default function InternshipApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const t = useTranslations("applicationDetail");

  useEffect(() => {
    if (!id) return;

    const fetchApplicationDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/company/applications/${id}`);
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
          {t("back")}
        </Button>
      </Box>
    );
  }

  if (!applicationData) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Typography variant="h6">{t("post_info_missing")}</Typography>
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
      <Stack direction="row" alignItems="center" mb={4}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
        >
          {t('back')}
        </Button>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          {t("page_title")}
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: "auto", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {t("status_section_title")}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Chip
            label={`${t("status")}: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            color={getStatusColor(status)}
            variant="filled"
          />
          <Typography variant="body1">
            <strong>{t("applied_at")}:</strong> {applied_at}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {student?.user ? (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {t("student_section_title")}
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
                <ListItemText primary={t("role")} secondary="Student" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("verified")}
                  secondary={student.user.verified ? "Yes" : "No"}
                />
              </ListItem>
              {student.university && (
                <ListItem disableGutters>
                  <ListItemText
                    primary={t("university")}
                    secondary={student.university.name || "N/A"}
                  />
                </ListItem>
              )}
              <ListItem disableGutters>
                <ListItemText primary={t("major")} secondary={student.major || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary={t("batch")} secondary={student.batch_year || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("skills")}
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
           {t("student_info_missing")}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {post ? (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {t("post_section_title")}
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary={t("post_title")} secondary={post.title || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary={t("description")} secondary={post.description || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary={t("requirements")} secondary={post.requirements || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary={t("responsibilities")} secondary={post.responsibilities || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary={t("benefits")} secondary={post.benefits || "N/A"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("application_deadline")}
                  secondary={post.application_deadline || "N/A"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary={t("created_at")} secondary={post.createdAt || "N/A"} />
              </ListItem>
            </List>
          </Box>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            {t("not_found")}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
