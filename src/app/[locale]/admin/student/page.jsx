"use client";
import {
  Box,
  Stack,
  Typography,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState, useCallback, useMemo, use } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useTranslations } from "next-intl";

export default function StudentList() {
  const { locale } = useParams();
  const t = useTranslations("admin_student"); 
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const getStudentList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/student");
      if (Array.isArray(res.data.data)) {
        setStudents(res.data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      setError("Failed to load students. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getStudentList();
  }, [getStudentList]);

  const openDeleteDialog = (id) => {
    setSelectedStudentId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedStudentId(null);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/student/${selectedStudentId}/delete`);
      getStudentList();
    } catch (err) {
      console.error("Error deleting student:", err);
    } finally {
      closeDeleteDialog();
    }
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const major = student.student?.major?.toLowerCase() || "";
      const status = student.status?.toLowerCase() || "";
      const university = student.student?.university?.name?.toLowerCase() || "";
      const batch = String(student.student?.batch_year || "").toLowerCase();
      const skills = student.student?.skills?.toLowerCase() || "";

      const matchSearch =
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        university.includes(query) ||
        batch.includes(query) ||
        skills.includes(query) ||
        major.includes(query) ||
        status.includes(query);

      const matchStatus =
        !filterStatus || status === filterStatus.toLowerCase();
      const matchMajor = !filterMajor || major === filterMajor.toLowerCase();

      return matchSearch && matchStatus && matchMajor;
    });
  }, [students, searchQuery, filterStatus, filterMajor]);

  const rows = filteredStudents.map((student, index) => ({
    id: index + 1,
    realId: student.id,
    name: student.name,
    email: student.email,
    status: student.status,
    university: student.student?.university?.name || "-",
    batch: student.student?.batch_year || "-",
    major: student.student?.major || "-",
  }));

  const columns = [
    { field: "id", headerName: t("no"), width: 70 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1 },
    {
      field: "status",
      headerName: t("status"),
      width: 110,
      renderCell: ({ value }) => (
        <Typography
          component={"span"}
          sx={{
            textTransform: "capitalize",
            fontSize: "14px",
            color:
              value === "approved"
                ? "green"
                : value === "declined"
                ? "red"
                : "orange",
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      ),
    },
    { field: "university", headerName: t("university"), flex: 1 },
    { field: "batch", headerName: t("batch"), width: 100 },
    { field: "major", headerName: t("major"), width: 150 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 120,
      renderCell: ({ row }) => (
        <>
          <Link href={`/${locale}/admin/student/${row.realId}`} passHref>
            <IconButton>
              <VisibilityIcon sx={{ color: "blue" }} />
            </IconButton>
          </Link>
          <IconButton onClick={() => openDeleteDialog(row.realId)}>
            <DeleteIcon sx={{ color: "red" }} />
          </IconButton>
        </>
      ),
    },
  ];

  const uniqueMajors = [
    ...new Set(students.map((s) => s.student?.major).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(students.map((s) => s.status).filter(Boolean)),
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
        <Typography ml={2}>Loading students...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
        <Typography variant="h5">Students</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            variant="outlined"
            placeholder= {t("search")}
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
            <InputLabel>Status</InputLabel>
            <Select
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Major</InputLabel>
            <Select
              value={filterMajor}
              label="Major"
              onChange={(e) => setFilterMajor(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueMajors.map((major) => (
                <MenuItem key={major} value={major}>
                  {major}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* ==== DataGrid ==== */}
      <Box height={500}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            backgroundColor: "white",
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f0f4fc",
            },
          }}
        />
      </Box>

      {/* ==== MUI Dialog for delete confirmation ==== */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this student? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
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
