"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  Divider,
  ButtonGroup,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TeacherDashboardApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchYearFilter, setBatchYearFilter] = useState("all");
  const t = useTranslations("teacher_applications");
  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/teacher/applications");
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to load applications");
        setApplications(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const batchYears = Array.from(
    new Set(applications.map((app) => app.student?.batch_year).filter(Boolean))
  ).sort((a, b) => b - a);

  const filteredApps = applications.filter((app) => {
    const matchStatus =
      statusFilter === "all" ? true : app.status === statusFilter;
    const matchBatch =
      batchYearFilter === "all"
        ? true
        : app.student?.batch_year === batchYearFilter;
    return matchStatus && matchBatch;
  });

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="max-w-md mx-auto my-10">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Box className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <ButtonGroup variant="outlined">
          {["all", "applied", "accepted", "rejected"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "contained" : "outlined"}
              color={
                status === "accepted"
                  ? "success"
                  : status === "rejected"
                  ? "error"
                  : status === "applied"
                  ? "primary"
                  : "info"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Batch Year</InputLabel>
          <Select
            value={batchYearFilter}
            label="Batch Year"
            onChange={(e) => setBatchYearFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {batchYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* If no matching applications */}
      {filteredApps.length === 0 ? (
        <Typography variant="h6" align="center" className="text-gray-600 py-10">
          No internship applications found for the selected filters.
        </Typography>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="hover:shadow-xl transition-shadow duration-300 border border-gray-200 rounded-xl flex flex-col"
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  mb={2}
                  size="large"
                >
                  <Avatar
                    sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}
                    size="large"
                  >
                    {app.student?.user?.image ? (
                      <img
                        src={app.student.user.image}
                        alt={app.student.user.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      app.student?.user?.name?.[0] || "S"
                    )}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={600} fontSize="1.1rem">
                      {app.student?.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {app.student?.university?.name || "Unknown University"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Batch: {app.student?.batch_year || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box mb={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WorkIcon fontSize="small" />
                    <Typography fontSize="0.95rem">
                      {app.post?.title || "Unknown Position"}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mt={0.5}
                  >
                    <BusinessIcon fontSize="small" />
                    <Typography fontSize="0.9rem" color="text.secondary">
                      {app.post?.company?.user?.name || "Unknown Company"}
                    </Typography>
                  </Stack>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Tooltip title={`Status: ${app.status.toUpperCase()}`} arrow>
                  <Chip
                    label={app.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor:"white",
                      color:
                        app.status === "accepted"
                          ? "#40e549ff"
                          : app.status === "rejected"
                          ? "#da3535ff"
                          : "#2778c9ff",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  />
                </Tooltip>
              </CardContent>

              {/* <Box sx={{ p: 2, pt: 0 }}>
                <Link href={`/teacher/applications/${app.id}`} passHref>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="medium"
                    sx={{ textTransform: "none" }}
                  >
                    View Details
                  </Button>
                </Link>
              </Box> */}
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
