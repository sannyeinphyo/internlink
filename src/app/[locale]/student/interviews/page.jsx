"use client";

import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

export default function StudentInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/interviews/student")
      .then((res) => setInterviews(res.data))
      .catch((err) => console.error("Error loading interviews:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        My Interviews
      </Typography>

      {interviews.length === 0 ? (
        <Typography>No interviews yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {interviews.map((interview) => (
            <Paper
              key={interview.id}
              sx={{
                p: 2,
                borderLeft: "6px solid",
                borderColor:
                  interview.status === "ACCEPTED"
                    ? "success.main"
                    : interview.status === "REJECTED"
                    ? "error.main"
                    : interview.status === "CANCELLED"
                    ? "warning.main"
                    : "info.main",
              }}
            >
              <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{interview.post.title}</Typography>
                <Chip
                  label={interview.status}
                  color={
                    interview.status === "ACCEPTED"
                      ? "success"
                      : interview.status === "REJECTED"
                      ? "error"
                      : interview.status === "CANCELLED"
                      ? "warning"
                      : "info"
                  }
                />
              </Grid>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Company: {interview.post.company.user.name}
              </Typography>

              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Scheduled At:{" "}
                    {interview.scheduledAt
                      ? dayjs(interview.scheduledAt).format("YYYY-MM-DD HH:mm")
                      : "Not scheduled yet"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Location: {interview.location || "Not specified"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Interview Type: {interview.type || "Not specified"}
                  </Typography>
                </Grid>

                {interview.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Details: {interview.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Typography
                variant="body2"
                sx={{ mt: 1 }}
                color="text.secondary"
              >
                For more information, please contact the company directly.
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
