"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import axios from "axios";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

export default function CompanyInterviewsPage() {
  const t = useTranslations("interviews");

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [newDate, setNewDate] = useState(dayjs());

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/interviews");
      setInterviews(res.data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const filteredInterviews = interviews.filter((iv) => {
    if (filter === "ALL") return true;
    return iv.status === filter;
  });

  const handleOpenReschedule = (interview) => {
    setSelectedInterview(interview);
    setNewDate(dayjs(interview.scheduledAt));
    setRescheduleDialogOpen(true);
  };

  const handleOpenCancel = (interview) => {
    setSelectedInterview(interview);
    setCancelDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setSelectedInterview(null);
    setRescheduleDialogOpen(false);
    setCancelDialogOpen(false);
  };

  const updateInterview = async (id, data) => {
    try {
      await axios.patch(`/api/interviews/${id}`, data);
      await fetchInterviews();
      handleCloseDialogs();
    } catch (error) {
      console.error("Failed to update interview:", error);
    }
  };

  const handleCancel = () => {
    if (!selectedInterview) return;
    updateInterview(selectedInterview.id, { status: "CANCELLED" });
  };

  const handleRescheduleConfirm = () => {
    if (!selectedInterview) return;
    updateInterview(selectedInterview.id, {
      scheduledAt: newDate.toISOString(),
    });
  };

  const statusColor = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "error",
    CANCELLED: "default",
  };

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        {t("title")}
      </Typography>

      <Tabs
        value={filter}
        onChange={(e, newVal) => setFilter(newVal)}
        sx={{ mb: 3 }}
      >
        <Tab label={t("all")} value="ALL" />
        <Tab label={t("pending")} value="PENDING" />
        <Tab label={t("accepted")} value="ACCEPTED" />
        <Tab label={t("rejected")} value="REJECTED" />
        <Tab label={t("cancelled")} value="CANCELLED" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : filteredInterviews.length === 0 ? (
        <Typography color="text.secondary">{t("no_interviews")}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>{t("student")}</TableCell>
                <TableCell>{t("internship")}</TableCell>
                <TableCell>{t("datetime")}</TableCell>
                <TableCell>{t("type")}</TableCell>
                <TableCell>{t("location")}</TableCell>
                <TableCell>{t("status")}</TableCell>
                <TableCell align="center">{t("actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInterviews.map((iv) => (
                <TableRow key={iv.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={iv.student?.user?.image || ""} />
                      <Box>
                        <Typography fontWeight={500}>
                          {iv.student?.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {iv.student?.user?.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {iv.student?.major} (
                          {iv.student?.batch_year || iv.student?.batch})
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{iv.post?.title}</TableCell>
                  <TableCell>
                    {iv.scheduledAt
                      ? new Date(iv.scheduledAt).toLocaleString()
                      : t("not_scheduled")}
                  </TableCell>
                  <TableCell>{t(iv.type)}</TableCell>
                  <TableCell>{iv.location || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(iv.status.toLowerCase())}
                      color={statusColor[iv.status] || "default"}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenReschedule(iv)}
                      >
                        {t("reschedule")}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenCancel(iv)}
                        disabled={iv.status !== "PENDING"}
                      >
                        {t("cancel")}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={rescheduleDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("reschedule_dialog_title")}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label={t("reschedule_label")}
              value={newDate}
              onChange={(val) => setNewDate(val)}
              disablePast
              slotProps={{
                textField: { fullWidth: true },
                popper: {
                  modifiers: [
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                    },
                  ],
                },
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialogs}>{t("cancel")}</Button>
          <Button variant="contained" onClick={handleRescheduleConfirm}>
            {t("reschedule_confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>{t("cancel_dialog_title")}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography>
            {t("cancel_dialog_text", {
              name: selectedInterview?.student?.user?.name || "",
              post: selectedInterview?.post?.title || "",
            })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialogs}>{t("cancel_no")}</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>
            {t("cancel_yes")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
