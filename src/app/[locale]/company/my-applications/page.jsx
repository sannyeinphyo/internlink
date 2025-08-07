"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
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
  const tinput = useTranslations("status");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState(null);
  const [dialogAction, setDialogAction] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [postFilter, setPostFilter] = useState("");

  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);

  const [interviewFormData, setInterviewFormData] = useState({
    scheduledAt: new Date(),
    location: "",
    type: "ONLINE",
  });

  const statusColors = {
    applied: { bg: "#1976d2", text: "fff" },
    accepted: { bg: "#4caf50", text: "fff" },
    rejected: { bg: "#e91e63", text: "fff" },
  };

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
    { field: "no", headerName: t("no"), width: 90 },
    { field: "studentName", headerName: t("name"), width: 180 },
    { field: "email", headerName: t("email"), width: 220 },
    { field: "applicationDate", headerName: t("applied_on"), width: 150 },
    {
      field: "status",
      headerName: t("status"),
      width: 150,

      renderCell: (params) => {
        const status = params.row.status || "default";
        const color = statusColors[status] || statusColors.default;
        const label = tinput(status, { default: status });

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
    { field: "post_title", headerName: t("post"), width: 200 },
    {
      field: "action",
      headerName: t("action"),
      headerAlign: "center",
      align: "center",
      width: 400,
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
                `/${locale}/company/my-applications/${params.row.application_id}?backUrl=/${locale}/company/my-applications`
              )
            }
          >
            <VisibilityIcon />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            disabled={params.row.status !== "applied"}
            onClick={() => {
              setDialogRow(params.row);
              setInterviewDialogOpen(true);
            }}
          >
            {t("schedule")}
          </Button>

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
            {t("accept")}
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
            {t("reject")}
          </Button>
        </Box>
      ),
    },
  ];
  const statusOptions = Array.from(
    new Set(applications.map((app) => app.status))
  );

  const postOptions = Array.from(
    new Set(applications.map((app) => app.post.title))
  );
  const filteredRows = applications
    .filter((app) => {
      const statusMatch = statusFilter ? app.status === statusFilter : true;
      const postMatch = postFilter ? app.post.title === postFilter : true;
      return statusMatch && postMatch;
    })
    .map((app, index) => ({
      no: index + 1,
      id: `${app.student_id}-${app.post_id}`,
      studentName: app.student.user.name || app.name || "N/A",
      email: app.student.user.email || "N/A",
      applicationDate: app.applied_at
        ? new Date(app.applied_at).toLocaleDateString()
        : "N/A",
      status: app.status || "N/A",
      post: app.post,
      student_id: app.student_id,
      post_id: app.post_id,
      post_title: app.post.title,
      application_id: app.id,
      company_id: app.post.company_id,
    }));

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mt: 6, mb: 2, fontWeight: "bold", textAlign: "left" }}
      >
        {t("student_applications")}
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
          <Box display="flex" gap={2} mb={2} justifyContent={"flex-end"}>
            <TextField
              select
              // label={t("filter_status")}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              SelectProps={{ native: true }}
              size="small"
              sx={{ width: 200 }}
            >
              <option value="">{t("all_statuses")}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {tinput(status)}
                </option>
              ))}
            </TextField>

            <TextField
              select
              // label={t("filter_post")}
              value={postFilter}
              onChange={(e) => setPostFilter(e.target.value)}
              SelectProps={{ native: true }}
              size="small"
              sx={{ width: 250 }}
            >
              <option value="">{t("all_posts")}</option>
              {postOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </TextField>
          </Box>
        )}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
          disableSelectionOnClick
          autoHeight
        />
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
      <Dialog
        open={interviewDialogOpen}
        onClose={() => setInterviewDialogOpen(false)}
      >
        <DialogTitle>{t("interview_schedule")}</DialogTitle>
        <DialogContent>
          <TextField
            label="Date & Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={interviewFormData.scheduledAt.toISOString().slice(0, 16)}
            onChange={(e) =>
              setInterviewFormData((prev) => ({
                ...prev,
                scheduledAt: new Date(e.target.value),
              }))
            }
          />
          <TextField
            label="Location or Zoom Link"
            fullWidth
            margin="normal"
            value={interviewFormData.location}
            onChange={(e) =>
              setInterviewFormData((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
          />
          <TextField
            select
            label="Type"
            SelectProps={{ native: true }}
            fullWidth
            margin="normal"
            value={interviewFormData.type}
            onChange={(e) =>
              setInterviewFormData((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
          >
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In Person</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterviewDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await axios.post("/api/interviews", {
                  studentId: dialogRow.student_id,
                  postId: dialogRow.post_id,
                  applicationId: dialogRow.application_id,
                  scheduledAt: interviewFormData.scheduledAt,
                  location: interviewFormData.location,
                  type: interviewFormData.type,
                });
                setSnackbar({
                  open: true,
                  message: "Interview scheduled successfully",
                  severity: "success",
                });
                fetchApplications();
              } catch (err) {
                console.error(err);
                setSnackbar({
                  open: true,
                  message: "Failed to schedule interview",
                  severity: "error",
                });
              } finally {
                setInterviewDialogOpen(false);
              }
            }}
          >
            {t("schedule")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
