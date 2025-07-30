"use client";

import { Box, IconButton, Snackbar, Alert, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { Chip } from "@mui/material";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Applications() {
  const statusColors = {
    applied: { bg: "#1976d2", text: "fff" },
    accepted: { bg: "#4caf50", text: "fff" },
    rejected: { bg: "#e91e63", text: "fff" },
  };
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const router = useRouter();
  const { locale , id } = useParams();
  const t = useTranslations("status");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("/api/internshipapplication");
      setApplications(res.data.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/internshipapplication/${id}`);
      setSnack({
        open: true,
        message: "Deleted application",
        severity: "success",
      });
      fetchApplications();
    } catch (error) {
      setSnack({
        open: true,
        message: "Delete failed",
        severity: "error",
      });
    }
  };

  const columns = [
    {
      field: "id",
      headerName: t("headers.no"),
      width: 70,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        `${params.api.getAllRowIds().indexOf(params.id) + 1}`,
    },
    {
      field: "postTitle",
      headerName:  t("headers.internshipTitle"),
      headerAlign: "center",
      align: "center",
      width: 250,
      renderCell: (params) => params?.row?.post?.title || "N/A",
    },
    {
      field: "status",
      headerName:  t("headers.applicationStatus"),
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
      field: "appliedAt",
      headerName: t("headers.appliedAt"),
      headerAlign: "center",
      align: "center",
      width: 180,
      renderCell: (params) =>
        params?.row?.applied_at
          ? new Date(params.row.applied_at).toLocaleString()
          : "N/A",
    },
    {
      field: "actions",
      headerName: t("headers.actions"),
      headerAlign: "center",
      align: "center",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            size="small"
           onClick={() => router.push(`/${locale}/jobs/${params.row.post.id}?backUrl=/${locale}/applications`)}
          >
            <VisibilityIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box mt={10} mx="auto" sx={{ height: 500, width: "90%", maxWidth: 900 }}>
        <Typography variant="h6" mb={2}>
          {t("title")}
        </Typography>

        <DataGrid
          rows={applications}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10]}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
