"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MUIDialogBox from "@/components/MUIDialogbox";
import { useTranslations } from "next-intl";

export default function MyApplications() {
  const { locale } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const t = useTranslations("myintern-ship");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState(null);
  const [dialogAction, setDialogAction] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/company/applications");
      setApplications(res.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDialogConfirm = async () => {
    if (!dialogRow || !dialogAction) return;

    try {
      await axios.patch("/api/company/applications", {
        student_id: dialogRow.student_id,
        post_id: dialogRow.post_id,
        status: dialogAction,
      });

      setSnackbar({
        open: true,
        message: `Student ${dialogAction} successfully`,
        severity: "success",
      });

      fetchApplications();
    } catch (error) {
      console.error("Update failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to update status.",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDialogRow(null);
      setDialogAction("");
    }
  };

  const columns = [
    { field: "no", headerName:t("no"), width: 90 },
    { field: "studentName", headerName:t("name"), width: 180 },
    { field: "email", headerName: t("email"), width: 220 },
    { field: "applicationDate", headerName: t("applied_on"), width: 150 },
    {
      field: "status",
      headerName: t("status"),
      width: 120,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case "accepted":
            color = "green";
            break;
          case "rejected":
            color = "red";
            break;
          case "applied":
            color = "blue";
        }

        return (
          <Box style={{ color }}>
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          </Box>
        );
      },
    },
    { field: "post_title", headerName: t("post"), width: 250 },
    {
      field: "action",
      headerName: t("action"),
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
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/${locale}/company/jobs_details/${params.row.post.id}?backUrl=/${locale}/company/my-applications`
              )
            }
          >
            <VisibilityIcon />
          </IconButton>
          <Button
            variant="contained"
            size="small"
            sx={{ minWidth: "auto", px: 1 }}
            disabled={params.row.status !== "applied"}
            onClick={() => {
              setDialogRow(params.row);
              setDialogAction("accepted");
              setDeleteDialogOpen(true);
            }}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            sx={{ minWidth: "auto", px: 1 }}
            disabled={params.row.status !== "applied"}
            onClick={() => {
              setDialogRow(params.row);
              setDialogAction("rejected");
              setDeleteDialogOpen(true);
            }}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];
  const rows = applications.map((app, index) => ({
    no: index + 1,
    id: `${app.student_id}-${app.post_id}`,
    studentName: app.student.user.name || app.name || "N/A",
    email: app.student.user.email || "N/A",
    applicationDate: app.applied_at
      ? new Date(app.applied_at).toLocaleDateString()
      : "N/A",
    status: app.status || "N/A",
    post: app.post, // ✅ Store full post object
    student_id: app.student_id,
    post_id: app.post_id,
    post_title: app.post.title,
  }));

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mt: 6, mb: 2, fontWeight: "bold", textAlign: "left" }}
      >
        Student Applications
      </Typography>
      <Paper elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            pagination
            disableSelectionOnClick
            autoHeight
          />
        )}
      </Paper>

      <MUIDialogBox
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title={`Confirm ${dialogAction === "accepted" ? "Accept" : "Reject"}`}
        message={`Are you sure you want to ${dialogAction} the application from "${
          dialogRow?.studentName || "this student"
        }" for the post "${dialogRow?.post_title || "this post"}"?`}
        confirmText={dialogAction === "accepted" ? "Accept" : "Reject"}
        confirmColor={dialogAction === "accepted" ? "primary" : "error"}
        onConfirm={handleDialogConfirm}
        showSnackbar={true}
        snackbar={snackbar}
        onSnackbarClose={handleSnackbarClose}
      />
    </Box>
  );
}
