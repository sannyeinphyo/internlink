"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CssBaseline,
  Container,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  Box,
  FormControl,
  InputLabel,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BarChart = dynamic(() =>
  import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);


const StatCard = ({ icon, label, value, cardColor }) => (
  <Card
    sx={{
      backgroundColor: cardColor || "white",
      minHeight: 130,
      borderRadius: 3,
      boxShadow: 3,
      transition: "transform 0.2s ease",
      "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      p: 2,
    }}
    elevation={4}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1, '&:last-child': { pb: 1 } }}>
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value ?? "-"}
        </Typography>
      </Box>
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
const t = useTranslations("university-dashboard");
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
    if (status === "authenticated" && session?.user) {
      fetchDashboardData(selectedYear);
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("You must be logged in to view this dashboard.");
    }
  }, [session, selectedYear, status]);


  const applicationStatusChartData = useMemo(() => {
    const data = dashboardData?.applicationStatusData || [];
    const chartData = {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Number of Applications',
          data: data.map(item => item.value),
          backgroundColor: [
            'rgba(25, 118, 210, 0.8)',
            'rgba(56, 142, 60, 0.8)',
            'rgba(211, 47, 47, 0.8)',
          ],
          borderColor: [
            'rgba(25, 118, 210, 1)',
            'rgba(56, 142, 60, 1)',
            'rgba(211, 47, 47, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    return chartData;
  }, [dashboardData]);

  const applicationStatusBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return `${label}${value} (${percentage})`;
          }
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#666',
        font: {
          weight: 'bold'
        },
        formatter: function(value, context) {
          return value;
        },
        display: function(context) {
          return context.dataset.data[context.dataIndex] > 0;
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const availableYears = useMemo(() => {
    const years = dashboardData?.allAvailableYears;
    if (years && years.length > 0) {
      return years;
    }
    const fallbackYears = [];
    const current = new Date().getFullYear();
    for (let i = -2; i <= 2; i++) {
        fallbackYears.push(current + i);
    }
    return fallbackYears.sort((a, b) => b - a);
  }, [dashboardData]);


  if (status === "loading" || loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent:"center",
          alignItems:"center",
          minHeight:"80vh",
          flexDirection:"column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Loading dashboard...</Typography>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CssBaseline />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold" component="h1">
         {t("title")}
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} mb={4} justifyContent={"center"}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<SchoolIcon fontSize="large" color="primary" />}
            label={t("teachers")}
            value={dashboardData?.totalTeachers ?? 0}
            cardColor="#E3F2FD"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<GroupIcon fontSize="large" color="success" />}
            label={t("students")}
            value={dashboardData?.totalStudents ?? 0}
            cardColor="#E8F5E9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<MailIcon fontSize="large" color="warning" />}
            label={t("applications")}
            value={dashboardData?.totalApplicationsSubmitted ?? 0}
            cardColor="#FFFDE7"
          />
        </Grid>
      </Grid>


      <Grid container spacing={3}>
        <Grid item xs={12} width={"100%"}> 
          <Card elevation={4} sx={{ borderRadius: 3, height: "100%", display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="bold">{t("applicationBreakdown")}</Typography>}
              subheader={<Typography variant="subtitle2" color="text.secondary">{t("applicationBreakdownSub")} {selectedYear}</Typography>}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 350 }}>
              {dashboardData?.applicationStatusData?.some(value => value.value > 0) ? (
                <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart data={applicationStatusChartData} options={applicationStatusBarOptions} />
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" mt={4}>
                 {t("noApplicationData")}{selectedYear}.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>


           <Grid item xs={12} width={"100%"}>  
          <Card elevation={4} sx={{ borderRadius: 3, height: "100%", display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="bold">{t("latestRegistrations")}</Typography>}
              subheader={<Typography variant="subtitle2" color="text.secondary">{t("latestRegistrationsSub")} {selectedYear}</Typography>}
            />
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {dashboardData?.latestUsers && dashboardData.latestUsers.length > 0 ? (
                <List dense>
                  {dashboardData.latestUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                   <ListItem disablePadding>
                     <ListItemText
  primary={
    <Typography variant="body1" fontWeight="medium">
      {user.name}
    </Typography>
  }
  secondary={ 
    <Box> 
      <Typography variant="body2" color="text.secondary">
        {user.role} &bull; {new Date(user.createdAt).toLocaleDateString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {user.email}
      </Typography>
    </Box>
  }
/>
                      </ListItem>
                      {index < dashboardData.latestUsers.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" textAlign="center" mt={4}>
                 {t("noRegistrations")}{selectedYear}.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}