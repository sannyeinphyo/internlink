"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useTranslations } from "next-intl";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("teacher-dashboard");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/api/teacher/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  console.log(stats);
  if (loading)
    return (
      <Box
        sx={{
          p: 8,
          textAlign: "center",
          fontSize: "1.2rem",
          color: "text.secondary",
        }}
      >
        Loading dashboard...
      </Box>
    );
  if (!stats)
    return (
      <Box
        sx={{
          p: 8,
          textAlign: "center",
          color: "error.main",
          fontWeight: "bold",
        }}
      >
        Failed to load dashboard.
      </Box>
    );

  const batchLabels = stats.batchYearStats
    ? Object.keys(stats.batchYearStats)
    : [];
  const batchData = {
    labels: batchLabels,
    datasets: [
      {
        label:t("applied"),
        data: batchLabels.map((y) => stats.batchYearStats[y].applied),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
      },
      {
        label: t("accept"),
        data: batchLabels.map((y) => stats.batchYearStats[y].accepted),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: t("reject"),
        data: batchLabels.map((y) => stats.batchYearStats[y].rejected),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const batchOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { font: { size: 14 } } },
      tooltip: { enabled: true, mode: "index", intersect: false },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        ticks: { font: { size: 13 } },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 13 } },
        grid: { color: "#e0e0e0" },
      },
    },
  };

  const columns = [
    {
      field: "no",
      headerName: t("no"),
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.row.no,
    },
    { field: "studentName", headerName:t("students"), flex: 1, minWidth: 150 },
    { field: "companyName", headerName: t("company"), flex: 1, minWidth: 150 },
    { field: "batch_year", headerName: t("batch_year"), width: 110 },
    {
      field: "status",
      headerName: t("status"),
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            fontWeight: "bold",
            color: getStatusColor(params.value),
            gap: 1,
          }}
        >
          <StatusDot color={getStatusColor(params.value)} />
          {capitalize(params.value)}
        </Box>
      ),
    },
  ];

  const rows =
    stats.recentApplications?.map((app, index) => ({
      id: index,
      no: index + 1,
      ...app,
    })) || [];

  return (
    <Box
      sx={{
        p: 8,
        maxWidth: 1200,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        📊 {t("teacher_dashboard")}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {stats.universityName || "Your University"}{", "}
        <Typography component={"span"} variant="subtitle1" p={0.2} borderRadius={1} color="text.secondary" gutterBottom >
           {stats.department}
        </Typography>
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        <StatCard
          title= {t("total_applications")}
          value={stats.total}
          color="primary.light"
        />
        <StatCard title={t("applied")} value={stats.applied} color="warning.light" />
        <StatCard
          title={t("accept")}
          value={stats.accepted}
          color="success.light"
        />
        <StatCard title={t("reject")} value={stats.rejected} color="error.light" />
      </Box>

      {batchLabels.length > 0 && (
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            fontWeight="medium"
          >
            {t("application_by_batch_year")}
          </Typography>
          <Bar data={batchData} options={batchOptions} />
        </Card>
      )}

      {rows.length > 0 && (
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: 440 }}>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            fontWeight="medium"
          >
            {t("recent_application")}
          </Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            density="comfortable"
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "primary.light",
                fontWeight: "bold",
                fontSize: 14,
                borderRadius: 1,
              },
              "& .MuiDataGrid-cell": {
                fontSize: 13,
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
              },
            }}
          />
        </Card>
      )}
    </Box>
  );
}

function StatCard({ title, value, color }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        p: 4,
        backgroundColor: color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: 6,
        },
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h3" fontWeight="bold" color="text.primary">
        {value}
      </Typography>
    </Card>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "applied":
      return "#1e88e5"; // MUI blue 600
    case "accepted":
      return "#43a047"; // MUI green 600
    case "rejected":
      return "#e53935"; // MUI red 600
    default:
      return "inherit";
  }
}

function capitalize(str) {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
}

function StatusDot({ color }) {
  return (
    <Box
      component="span"
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: color,
        display: "inline-block",
      }}
    />
  );
}
