"use client";

import {
  Box,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Delete } from "@mui/icons-material";

export default function Applications() {
  const statusColors = {
    applied: { bg: "#1976d2", text: "fff" },
    accepted: { bg: "#4caf50", text: "fff" },
    rejected: { bg: "#e91e63", text: "fff" },
  };

  const interviewStatusColors = {
    PENDING: { bg: "#ff9800", text: "fff" },
    ACCEPTED: { bg: "#4caf50", text: "fff" },
    REJECTED: { bg: "#e91e63", text: "fff" },
  };

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations("status");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);

  const handleDialogOpen = (interviewId, action) => {
    setSelectedInterviewId(interviewId);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedInterviewId(null);
    setDialogAction("");
  };

  const handleDialogConfirm = async () => {
    if (selectedInterviewId && dialogAction) {
      await updateInterviewStatus(selectedInterviewId, dialogAction);
    }
    handleDialogClose();
  };

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

  const updateInterviewStatus = async (interviewId, status) => {
    try {
      await axios.patch(`/api/interviews/${interviewId}`, { status });
      setSnack({
        open: true,
        message: `Interview ${status.toLowerCase()} successfully`,
        severity: "success",
      });
      fetchApplications();
    } catch (error) {
      setSnack({
        open: true,
        message: `Failed to update interview status`,
        severity: "error",
      });
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    console.log("Deleting application id:", applicationId);
    try {
      await axios.delete(`/api/company/applications/${applicationId}/delete`);
      setSnack({
        open: true,
        message: "Application deleted successfully",
        severity: "success",
      });
      fetchApplications();
    } catch (error) {
      setSnack({
        open: true,
        message: "Failed to delete application",
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
      headerName: t("headers.internshipTitle"),
      headerAlign: "center",
      align: "center",
      width: 250,
      renderCell: (params) => params?.row?.post?.title || "N/A",
    },
    {
      field: "status",
      headerName: t("headers.applicationStatus"),
      headerAlign: "center",
      align: "center",
      width: 180,
      renderCell: (params) => {
        const status = params.row.status || "default";
        const color = statusColors[status] || statusColors.default;
        const label = t(status, { default: status });

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              minWidth: "120px",
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
      field: "interviewStatus",
      headerName: t("headers.interview_status"),
      headerAlign: "center",
      align: "center",
      width: 180,
      renderCell: (params) => {
        const interview = params.row.Interview?.[0];
        if (!interview) return "-";
        const status = interview.status || "PENDING";
        const label = t(status, { default: status });
        const color =
          interviewStatusColors[status] || interviewStatusColors.PENDING;

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              minWidth: "120px",
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
      field: "interviewActions",
      headerName: t("headers.interview_action"),
      headerAlign: "center",
      align: "center",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const interview = params.row.Interview?.[0];
        const disabled = !interview || interview.status !== "PENDING";

        return (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            height={"100%"}
          >
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={disabled}
              onClick={() =>
                !disabled && handleDialogOpen(interview.id, "ACCEPTED")
              }
            >
              {t("ACCEPT")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={disabled}
              onClick={() =>
                !disabled && handleDialogOpen(interview.id, "REJECTED")
              }
            >
              {t("REJECT")}
            </Button>
          </Stack>
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
            onClick={() =>
              router.push(
                `/${locale}/jobs/${params.row.post.id}?backUrl=/${locale}/applications`
              )
            }
          >
            <VisibilityIcon />
          </IconButton>
          {params.row.status === "applied" && (
            <IconButton
              color="secondary"
              size="small"
              onClick={() => handleDeleteApplication(params.row.id)}
            >
              <Delete />
            </IconButton>
          )}
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box mt={10} mx="auto" sx={{ height: 500, width: "90%", maxWidth: 1250 }}>
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
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogAction === "ACCEPTED"
            ? t("confirmAcceptTitle")
            : t("confirmRejectTitle")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogAction === "ACCEPTED"
              ? t("confirmAcceptMessage")
              : t("confirmRejectMessage")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleDialogClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleDialogConfirm}
            color={dialogAction === "ACCEPTED" ? "primary" : "error"}
          >
            {t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
