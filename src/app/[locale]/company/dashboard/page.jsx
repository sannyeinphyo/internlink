"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
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
  Chip,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";
import { Visibility } from "@mui/icons-material";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  BarElement
);

export default function CompanyDashboard() {
  const tcompany = useTranslations("company_dashboard")
  const tapp = useTranslations("student_applications");
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const t = useTranslations("status");
  const router = useRouter();
  const { locale } = useParams();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2025");
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const statusColors = {
    applied: { bg: "#1976d2", text: "fff" },
    accepted: { bg: "#4caf50", text: "fff" },
    rejected: { bg: "#e91e63", text: "fff" },
  };

  const fetchDashboardData = useCallback(
    async (yearParam = year) => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/company/dashboard?year=${yearParam}`);
        setDashboardData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    },
    [year]
  );

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await axios.get("/api/company/applications");
      setApplications(res.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications", error);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
  }, [fetchDashboardData, fetchApplications]);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };
  const handleExportCSV = () => {
    if (!dashboardData) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Applications", dashboardData.totalApplications],
      ["Total Job Posts", dashboardData.totalPosts],
      ["Accepted Applications", dashboardData.applicationStatus.accepted],
      ["Applied Applications", dashboardData.applicationStatus.applied],
      ["Rejected Applications", dashboardData.applicationStatus.rejected],
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `company-dashboard-${year}.csv`);
  };

  if (loading || !dashboardData) {
    return (
      <Box p={3} className="text-center">
        <Typography variant="h6" gutterBottom>
          Loading dashboard...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    {
      label: tcompany("sub_heading.total_applications"),
      value: dashboardData.totalApplications,
      color: "#d32f2f",
    },
    {
      label:tcompany("sub_heading.total_jobs_posts"),
      value: dashboardData.totalPosts,
      color: "#ff9800",
    },
    {
      label: tcompany("sub_heading.total_saved_posts"),
      value: dashboardData.totalSavedPosts,
      color: "#1976d2",
    },
    {
      label:tcompany("sub_heading.total_accepted"),
      value: dashboardData.applicationStatus.accepted,
      color: "#2e7d32",
    },
    {
      label: tcompany("sub_heading.total_rejected"),
      value: dashboardData.applicationStatus.rejected,
      color: "#c62828",
    },
  ];

  const columns = [
    {
      field: "no",
      headerName: tapp("no"),
      width: 90,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "studentName",
      headerName: tapp("student_name"),
      width: 180,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "email",
      headerName: tapp("email"),
      width: 220,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "applicationDate",
      headerName: tapp("applied_on"),
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "status",
      headerName: tapp('status'),
      headerAlign: "center",
      align: "center",
      width: 130,
      renderCell: (params) => {
        const status = params.row.status || "default";
        const color = statusColors[status] || statusColors.default;
        const label = t(status);

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              minWidth: "80px",
              backgroundColor: color.bg,
              color: "white",
              fontWeight: 500,
              borderRadius: 1,
              margin: "4px 2px 0 2px",
            }}
          />
        );
      },
    },
    {
      field: "post",
      headerName: tapp("post"),
      width: 250,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "action",
      headerName: tapp("action"),
      headerAlign: "center",
      align: "center",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: "100%",
          }}
        >
          <>
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                router.push(
                  `/${locale}/company/view_student/${params.row.studentId}?backUrl=/${locale}/company/dashboard`
                )
              }
            >
              <Visibility />
            </IconButton>
          </>
        </Box>
      ),
    },
  ];

  const rows = applications.map((app, index) => ({
    post_id: app.post_id,
    studentId : app.student.user_id,
    id: app.id,
    no: index+1,
    studentName: app.student?.user?.name || "N/A",
    email: app.student?.user?.email || "N/A",
    applicationDate: app.applied_at
      ? new Date(app.applied_at).toLocaleDateString()
      : "N/A",
    status: app.status || "N/A",
    post: app.post?.title || "N/A",
  }));
  console.log("Getting information:" , applications)

  return (
    <Box className="p-6">
      <Paper
        elevation={3}
        className="p-6 mb-8 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-400 text-white shadow-lg"
      >
        <Typography variant="h4" fontWeight="bold">
          {tcompany("heading")}
        </Typography>
        <Typography variant="subtitle1" className="opacity-90">
          {year} {tcompany("heading_description")}
        </Typography>
      </Paper>
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            value={year}
            onChange={handleYearChange}
            label="Year"
          >
            <MenuItem value="2023">2023</MenuItem>
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleExportCSV}
        >
          Download CSV
        </Button>
      </div>

      <Grid container spacing={3} justifyContent={"center"}>
        {stats.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <div
              className="bg-white shadow-lg rounded-xl p-6 text-center border-t-4 max-w-40 min-h-48"
              style={{ borderColor: item.color }} 
            >
              <h2 className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </h2>
              <p className="text-gray-700">{item.label}</p>
            </div>
          </Grid>
        ))}
      </Grid>

      <div className="mt-10">
        <Typography variant="h6" fontWeight="bold" className="mb-2">
         {tapp("tabel_heading")}
        </Typography>
        <Paper elevation={3} className="rounded-xl p-4">
          {loadingApps ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              pagination
              disableSelectionOnClick
              autoHeight
              className="rounded-xl bg-white"
            />
          )}
        </Paper>
      </div>
    </Box>
  );
}
