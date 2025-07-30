"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ViewStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const { locale } = useParams();

  useEffect(() => {
    axios
      .get("/api/teacher/view_student")
      .then((res) => {
        setStudents(res.data.students);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load students:", err);
        setLoading(false);
      });
  }, []);

  const batchYears = useMemo(() => {
    const years = students
      .map((s) => s.batch_year)
      .filter((y) => y !== null && y !== undefined);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesName = student.user.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesBatch =
        batchFilter === "all" || student.batch_year === batchFilter;
      return matchesName && matchesBatch;
    });
  }, [students, searchName, batchFilter]);

  if (loading) {
    return (
      <Box className="flex flex-col items-center mt-20 space-y-4">
        <CircularProgress />
        <Typography mt={2} variant="body1" color="textSecondary">
          Loading students...
        </Typography>
      </Box>
    );
  }

  if (!students.length) {
    return (
      <Typography
        variant="h6"
        color="textSecondary"
        align="center"
        className="mt-20"
      >
        No students registered yet.
      </Typography>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto p-6">
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        className="text-center mb-8"
      >
        Registered Students
      </Typography>

      {/* Filters */}
      <Box className="flex flex-col sm:flex-row sm:justify-center gap-4 mb-8">
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-full sm:w-72"
        />

        <TextField
          select
          label="Batch Year"
          variant="outlined"
          size="small"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <MenuItem value="all">All Batch Years</MenuItem>
          {batchYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {filteredStudents.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center">
          No students match your criteria.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={student.user.id}>
              <Card
                elevation={3}
                sx={{
                  width: "100%",
                  height: 320,
                  p: 6,
                  bgcolor: "blue.50",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover": {
                    boxShadow: 8,
                  },
                }}
              >
                <Avatar
                  src={student.user.image || ""}
                  alt={student.user.name}
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    bgcolor: "#1976d2",
                    fontSize: 30,
                  }}
                >
                  {!student.user.image && student.user.name[0]}
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    textAlign: "center",
                    color: "primary.dark",
                    fontWeight: 600,
                  }}
                >
                  {student.user.name}
                </Typography>

                <Typography
                  component="a"
                  href={`mailto:${student.user.email}`}
                  sx={{
                    mb: 1,
                    textAlign: "center",
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                    wordBreak: "break-word",
                    cursor: "pointer",
                  }}
                  noWrap
                >
                  {student.user.email}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 500, mb: 2 }}
                >
                  Batch Year: {student.batch_year || "N/A"}
                </Typography>

                <Link
                  href={`/${locale}/teacher/view_student/${student.user.id}`}
                  className="text-blue-600 hover:text-blue-800  underline"
                >
                  View Profile
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
