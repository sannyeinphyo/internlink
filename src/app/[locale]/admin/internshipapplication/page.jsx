"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function InternshipApplicationList() {
  const { locale } = useParams();
  const t = useTranslations("internship");

  const [allApplications, setAllApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const internshipApplicationsPerPage = 10;
  const applicationStatuses = ["applied", "accepted", "rejected"];

  // ✅ Fetch all applications once
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/admin/internshipapplication");

        if (Array.isArray(response.data.data)) {
          setAllApplications(response.data.data);
        } else {
          setAllApplications([]);
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(t("load_error"));
        setAllApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [t]);

  const filteredApplications = allApplications.filter((app) => {
    const matchesSearch =
      app.post_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.student_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus ? app.status === filterStatus : true;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredApplications.length / internshipApplicationsPerPage);

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * internshipApplicationsPerPage,
    currentPage * internshipApplicationsPerPage
  );

  const handleDeleteClick = (id) => {
    setSelectedAppId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/internshipapplication/${selectedAppId}/delete`);
      setAllApplications((prev) => prev.filter((app) => app.id !== selectedAppId));
      setOpenDialog(false);
      setSelectedAppId(null);
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const rows = paginatedApplications.map((app, index) => ({
    id: app.id,
    no: (currentPage - 1) * internshipApplicationsPerPage + index + 1,
    post_name: app.post_name,
    student_name: app.student_name,
    status: app.status,
    applied_at: app.applied_at,
  }));

  const columns = [
    { field: "no", headerName: t("no"), width: 80 },
    { field: "post_name", headerName: t("post_name"), flex: 1 },
    { field: "student_name", headerName: t("student_name"), flex: 1 },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            color:
              params.value === "accepted"
                ? "green"
                : params.value === "rejected"
                ? "red"
                : "blue",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "applied_at", headerName: t("applied_at"), flex: 1 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <Link href={`/${locale}/admin/internshipapplication/${params.row.id}`} passHref>
            <IconButton>
              <VisibilityIcon sx={{ color: "blue" }} />
            </IconButton>
          </Link>
          <IconButton onClick={() => handleDeleteClick(params.row.id)}>
            <DeleteIcon sx={{ color: "red" }} />
          </IconButton>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography ml={2}>{t("loading")}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* <Typography variant="h5" gutterBottom>{t("applications")}</Typography> */}

      <Box display="flex" flexWrap="wrap" gap={2} mb={2} justifyContent={"flex-end"}>
        <TextField
          variant="outlined"
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t("status")}</InputLabel>
          <Select
            value={filterStatus}
            label={t("status")}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            {applicationStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 550, width: "100%", backgroundColor: "white" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={internshipApplicationsPerPage}
          pagination
          page={currentPage - 1}
          onPageChange={(newPage) => setCurrentPage(newPage + 1)}
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("delete_warning")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            {t("cancel")}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
