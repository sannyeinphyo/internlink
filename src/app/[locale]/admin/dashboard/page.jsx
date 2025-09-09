"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import axios from "axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { Bar } from "react-chartjs-2";
import { BarElement } from "chart.js";
import { useTranslations } from "next-intl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const t = useTranslations("admin")
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear.toString());
  const [error, setError] = useState(null);

  const fetchDashboardData = async (yearParam = year) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/admin/dashboard?year=${yearParam}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(year);
  }, [year]);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const stats = useMemo(
    () => [
      {
        label: t("total_student"),
        value: dashboardData?.totalStudents || 0,
        color: "#1976d2",
      },
      {
        label: t("total_company"),
        value: dashboardData?.totalCompanies || 0,
        color: "#2e7d32",
      },
      {
        label: t("total_applications"),
        value: dashboardData?.totalApplications || 0,
        color: "#d32f2f",
      },
      {
        label: t("total_jobs"),
        value: dashboardData?.totalPosts || 0,
        color: "#ff9800",
      },
      {
        label: t('Verified'),
        value: dashboardData?.accountVerification?.verified || 0,
        color: "#1eff00ff",
      },
      {
        label: t("unverified"),
        value: dashboardData?.accountVerification?.unverified || 0,
        color: "#ff0000ff",
      },
    ],
    [dashboardData]
  );

  const barChartData = {
    labels: [
      "Students",
      "Universities",
      "Companies",
      "Posts",
      "Total Applications",
      "Applied",
      "Accepted",
      "Rejected",
      "Total User",
    ],
    datasets: [
      {
        label: "Counts",
        data: [
          dashboardData?.totalStudents || 0,
          dashboardData?.totalUniversity || 0,
          dashboardData?.totalCompanies || 0,
          dashboardData?.totalPosts || 0,
          dashboardData?.totalApplications || 0,
          dashboardData?.applicationStatus?.applied || 0,
          dashboardData?.applicationStatus?.accepted || 0,
          dashboardData?.applicationStatus?.rejected || 0,
          dashboardData?.totalUsers || 0,
        ],
        backgroundColor: [
          "#1976d2",
          "#7e57c2",
          "#26c6da",
          "#ffa726",
          "#66bb6a",
          "#ef5350",
          "#26a69a",
          "#8d6e63",
          "#42a5f5",
          "#66bb6a",
          "#ef5350",
          "#50ef85ff",
        ],
        borderRadius: 2,
        barThickness: 50,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, fontWeight: "bold" } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10 } },
      },
    },
  };
  const handleExportCSV = () => {
    if (!dashboardData) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Students", dashboardData.totalStudents || 0],
      ["Total Companies", dashboardData.totalCompanies || 0],
      ["Total Applications", dashboardData.totalApplications || 0],
      ["Total Job Posts", dashboardData.totalPosts || 0],
      ["Accepted Applications", dashboardData.applicationStatus?.accepted || 0],
      ["Applied Applications", dashboardData.applicationStatus?.applied || 0],
      ["Rejected Applications", dashboardData.applicationStatus?.rejected || 0],
      ["Verified Users", dashboardData.accountVerification?.verified || 0],
      ["Unverified Users", dashboardData.accountVerification?.unverified || 0],
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `dashboard-${year}.csv`);
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" gutterBottom>
          Loading dashboard...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }
  const studentColumns = [
    { field: "no", headerName: t("no"), width: 70 },
    { field: "name", headerName: t("name"), width: 200 },
    { field: "email", headerName: t("email"), width: 250 },
    {
      field: "createdAt",
      headerName: t("joined_at"),
      width: 180,
    },
    {
      field: "major",
      headerName: t("major"),
      width: 150,
    },
  ];

  const companyColumns = [
    { field: "no", headerName: t("no"), width: 70 },
    { field: "name", headerName:  t("name"), width: 200 },
    { field: "email", headerName: t("email"), width: 250 },
    {
      field: "createdAt",
      headerName: t("joined_at"),
      width: 180,
    },
    {
      field: "location",
      headerName: t("location"),
      width: 150,
    },
  ];

  const studentsRows = (dashboardData?.recentStudents || []).map(
    (student, index) => ({
      id: student.id,
      no: index + 1,
      name: student.user.name,
      email: student.user.email,
      createdAt: student.user.createdAt || null,
      major: student.major,
    })
  );

  const companiesRows = (dashboardData?.recentCompanies || []).map(
    (company, index) => ({
      id: company.id,
      no: index + 1,
      name: company.user.name,
      email: company.user.email,
      createdAt: company.user.createdAt || null,
      location: company.location,
    })
  );

  if (error || !dashboardData) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="error" gutterBottom>
          {error || "Something went wrong."}
        </Typography>
        <Button onClick={() => fetchDashboardData(year)} variant="outlined">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "1440px", mx: "auto" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            value={year}
            onChange={handleYearChange}
            label="Year"
          >
            {years.map((yr) => (
              <MenuItem key={yr} value={yr.toString()}>
                {yr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={handleExportCSV}>
          Download CSV
        </Button>
      </Box>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
       {t("dashboard")}
      </Typography>

      {/* Stats */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
        {t("Overview")}
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {stats.map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                textAlign: "center",
                borderLeft: `5px solid ${item.color}`,
                minWidth: 0,
                width: "100%",
              }}
            >
              <Typography variant="h6">{item.value}</Typography>
              <Typography variant="body2" color="textSecondary">
                {item.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t("fulldata")}
        </Typography>
        <Paper elevation={3} sx={{ p: 3, overflowX: "auto" }}>
          <Box sx={{ height: { xs: 300, sm: 400, md: 500 } }}>
            <Bar data={barChartData} options={barChartOptions} />
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          {t("recentstudents")}
        </Typography>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: 600, height: 350 }}>
            <DataGrid
              rows={studentsRows}
              columns={studentColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
          {t("recentcompanies")}
        </Typography>
        <div style={{ height: 350, width: "100%" }}>
          <DataGrid
            rows={companiesRows}
            columns={companyColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </div>
      </Box>
    </Box>
  );
}
