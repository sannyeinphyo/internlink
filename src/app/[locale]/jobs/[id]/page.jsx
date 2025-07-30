"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
  Box,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  AttachMoney,
  Email,
} from "@mui/icons-material";

export default function JobPage() {
  const params = useParams();
  const { id, locale } = params || {};
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const backUrl = searchParams.get("backUrl") || `/${locale}/jobs`;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/internship_post/${id}`, {
          withCredentials: true,
        });
        setJob(res.data.data || null);
      } catch (error) {
        console.error("Failed to fetch job:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!job) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <Typography variant="h6" color="error">
          Job not found.
        </Typography>
      </Container>
    );
  }


  return (
    <Box sx={{ bgcolor: "#fafafa", py: 6, minHeight: "90vh" }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={4}
            alignItems="flex-start"
          >
            <Paper
              elevation={4}
              sx={{
                flex: 3,
                p: 4,
                borderRadius: 4,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                {job.title}
              </Typography>

              <Typography
                variant="subtitle1"
                gutterBottom
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Company: <strong>{job.company?.name || "Unknown"}</strong>
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Tags */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                <Chip
                  label={job.paid ? "Paid" : "Unpaid"}
                  color={job.paid ? "success" : "default"}
                />
                {job.job_type && <Chip label={job.job_type} color="info" />}
                {job.remote && <Chip label="Remote" color="secondary" />}
                {job.positions && (
                  <Chip
                    label={`${job.positions} Position${
                      job.positions > 1 ? "s" : ""
                    }`}
                  />
                )}
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                    Description
                  </Typography>
                  <Typography>{job.description}</Typography>
                </Box>

                {job.responsibilities && (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                      Responsibilities
                    </Typography>
                    <Typography>{job.responsibilities}</Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                    Requirements
                  </Typography>
                  <Typography>{job.requirements}</Typography>
                </Box>

                {job.benefits && (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                      Benefits
                    </Typography>
                    <Typography>{job.benefits}</Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                    Details
                  </Typography>
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    {job.salary && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney fontSize="small" />
                        <Typography>Salary: ${job.salary}</Typography>
                      </Box>
                    )}
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" />
                      <Typography>{job.location}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" />
                      <Typography>
                        Start: {new Date(job.start_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" />
                      <Typography>
                        End: {new Date(job.end_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {job.application_deadline && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday fontSize="small" />
                        <Typography>
                          Deadline:{" "}
                          {new Date(
                            job.application_deadline
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {job.contact_email && (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                      Contact
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" />
                      <Typography>{job.contact_email}</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>

            
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={() => router.push(backUrl)}>
                  ← Back to Jobs
                </Button>
              </Stack>
            </Paper>

            
            <Box
              sx={{
                flex: 1,
                position: "sticky",
                top: theme.spacing(12),
                alignSelf: "flex-start",
                bgcolor: "#e3f2fd",
                borderRadius: 4,
                p: 3,
                boxShadow: 2,
                height: "fit-content",
                minWidth: isMobile ? "auto" : 280,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Why This Job?
              </Typography>
              <Typography sx={{ mb: 2 }}>
                This internship offers a great opportunity to gain real-world
                experience, work with a talented team, and build your
                professional skills.
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Remember to tailor your application to highlight relevant skills
                and experience.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Quick Tips
              </Typography>
              <ul style={{ paddingLeft: "1.2rem", marginTop: 0 }}>
                <li>Read the job description carefully.</li>
                <li>Customize your resume and cover letter.</li>
                <li>Prepare for the interview by researching the company.</li>
                <li>Follow up after submitting your application.</li>
              </ul>
            </Box>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
