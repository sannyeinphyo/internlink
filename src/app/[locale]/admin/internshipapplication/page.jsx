// InternshipApplicationList with MUI DataGrid and MUI Dialog replacing Table and toast.
"use client";

import React, { useEffect, useState, useCallback } from "react";
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

export default function InternshipApplicationList() {
  const { locale } = useParams();

  const [internshipApplications, setInternshipApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const internshipApplicationsPerPage = 10;
  const applicationStatuses = ["applied", "accepted", "rejected"];

  const getInternshipApplicationList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/internshipapplication", {
        params: {
          page: currentPage,
          pageSize: internshipApplicationsPerPage,
          search: searchQuery,
          status: filterStatus,
        },
      });

      if (Array.isArray(response.data.data)) {
        setInternshipApplications(response.data.data);
      } else {
        setInternshipApplications([]);
      }

      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load internship applications.");
      setInternshipApplications([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, internshipApplicationsPerPage, searchQuery, filterStatus]);

  useEffect(() => {
    getInternshipApplicationList();
  }, [getInternshipApplicationList]);

  const handleDeleteClick = (id) => {
    setSelectedAppId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/internshipapplication/${selectedAppId}/delete`);
      getInternshipApplicationList();
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setOpenDialog(false);
      setSelectedAppId(null);
    }
  };

  const rows = internshipApplications.map((app, index) => ({
    id: app.id,
    no: (currentPage - 1) * internshipApplicationsPerPage + index + 1,
    post_name: app.post_name,
    student_name: app.student_name,
    status: app.status,
    applied_at: app.applied_at,
  }));

  const columns = [
    { field: "no", headerName: "No.", width: 80 },
    { field: "post_name", headerName: "Post Name", flex: 1 },
    { field: "student_name", headerName: "Student Name", flex: 1 },
    {
      field: "status",
      headerName: "Status",
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
    { field: "applied_at", headerName: "Applied At", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
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
        <Typography ml={2}>Loading applications...</Typography>
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
      <Typography variant="h5" gutterBottom>Internship Applications</Typography>

      <Box display="flex" flexWrap="wrap" gap={2} mb={2} justifyContent={"flex-end"}>
        <TextField
          variant="outlined"
          placeholder="Search by post or student name"
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
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
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
          rowCount={totalPages * internshipApplicationsPerPage}
          paginationMode="server"
          onPageChange={(params) => setCurrentPage(params + 1)}
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this application?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
