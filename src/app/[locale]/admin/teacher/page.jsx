"use client";

import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";

export default function TeacherList() {
  const { locale } = useParams();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const getTeacherList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/teacher");
      if (Array.isArray(response.data.data)) {
        setTeachers(response.data.data);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      setError("Failed to load teachers. Please try again.");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTeacherList();
  }, [getTeacherList]);

  const handleDeleteClick = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/teacher/${selectedTeacherId}/delete`);
      setOpenDialog(false);
      setSelectedTeacherId(null);
      getTeacherList();
    } catch (error) {
      console.error("Error deleting Teacher:", error);
      setOpenDialog(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    const teacherStatus = teacher.status?.toLowerCase() || "";
    const matchesSearch =
      teacher.name.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query) ||
      teacher.teacher?.department?.toLowerCase().includes(query) ||
      (teacher.teacher?.university?.name &&
        teacher.teacher.university.name.toLowerCase().includes(query)) ||
      teacherStatus.includes(query);

    const matchesStatus =
      filterStatus === "" || teacherStatus === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns = [
    { field: "no", headerName: "No", width: 80 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            fontWeight: 600,
            color:
              params.value === "approved"
                ? "green"
                : params.value === "declined"
                ? "red"
                : "orange",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "university",
      headerName: "University",
      flex: 1.2,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <Link href={`/${locale}/admin/teacher/${params.row.id}`} passHref>
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

  const rows = filteredTeachers.map((teacher, index) => ({
    id: teacher.id,
    no: index + 1,
    name: teacher.name,
    email: teacher.email,
    status: teacher.status,
    university: teacher.teacher?.university?.name || "-",
    department: teacher.teacher?.department || "-",
  }));

  const uniqueStatuses = [
    ...new Set(teachers.map((teacher) => teacher.status).filter(Boolean)),
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography ml={2}>Loading teachers...</Typography>
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
      <Typography variant="h5" mb={2}>Teachers</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" mb={2} justifyContent={"flex-end"}>
        <TextField
          variant="outlined"
          placeholder="Search by any field"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { minWidth: 250 },
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {uniqueStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ height: 520, width: "100%", backgroundColor: "white" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this teacher? This action cannot be undone.
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
