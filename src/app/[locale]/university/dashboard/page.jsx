"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CssBaseline,
  Container,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  Box,
  Stack,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const StatCard = ({ icon, label, value, cardColor }) => (
  <Card
    sx={{
      backgroundColor: cardColor || "white",
      minHeight: 130,
      borderRadius: 3,
      boxShadow: 3,
      transition: "transform 0.2s ease",
      "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
    }}
    elevation={4}
  >
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        {icon}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value ?? "-"}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function UniversityDashboard() {
  const { data: session, status } = useSession();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/university/dashboard?year=${year}`);
      if (response.data?.data) {
        setDashboardData(response.data.data);
      } else {
        setDashboardData(null);
        setError("No dashboard data received.");
      }
    } catch (err) {
      let msg = "Failed to load dashboard data. Please try again.";
      if (err.response?.status === 401) msg = "You are not authenticated.";
      else if (err.response?.status === 403) msg = "You are not authorized.";
      else if (err.response?.data?.message) msg = err.response.data.message;
      setError(msg);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchDashboardData(selectedYear);
  }, [session, selectedYear]);

  const applicationStatusData = dashboardData?.applicationStatusData || [];
  const latestStudents = (dashboardData?.latestUsers || []).filter(user => {
  if (user.role !== "student") return false;
  if (!user.createdAt) return false;
  const userYear = new Date(user.createdAt).getFullYear();
  return userYear === selectedYear;
});

  const COLORS = ["blue", "green", "red"];
const availableYears = React.useMemo(() => {
  if (!dashboardData?.latestUsers) return [];
  const yearsSet = new Set();
  dashboardData.latestUsers.forEach(user => {
    if (user.createdAt) {
      yearsSet.add(new Date(user.createdAt).getFullYear());
    }
  });
  return Array.from(yearsSet).sort((a, b) => b - a);
}, [dashboardData]);


  if (status === "loading" || loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Loading dashboard...</Typography>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          textAlign: "center",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          You must be logged in to view this dashboard.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
        <Typography>Please try refreshing the page.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <CssBaseline />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={4}
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold" component="h1">
          University Dashboard
        </Typography>
        <Select
        label="Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Grid container spacing={3} mb={4} justifyContent={"center"}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<SchoolIcon fontSize="large" color="primary" />}
            label="Total Teachers"
            value={dashboardData?.totalTeachers ?? "-"}
            cardColor="#E3F2FD"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<GroupIcon fontSize="large" color="primary" />}
            label="Total Students"
            value={dashboardData?.totalStudents ?? "-"}
            cardColor="#F1F8E9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<MailIcon fontSize="large" color="primary" />}
            label="Applications Submitted"
            value={dashboardData?.totalApplicationsSubmitted ?? "-"}
            cardColor="#FFF3E0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} display={"flex"} flexDirection={"column"}>
        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Application Status Breakdown
              </Typography>
              {applicationStatusData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={applicationStatusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1976d2">
                      {applicationStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" mt={4}>
                  No application data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Latest Users Added
              </Typography>
              {latestStudents.length ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small" aria-label="latest users table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {latestStudents.map((user, i) => (
                        <TableRow key={i} hover tabIndex={-1}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  No recent users found.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
