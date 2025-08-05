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
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function UniversityList() {
  const { locale } = useParams();
  const  t  = useTranslations("admin_university"); 

  const [universities, setUniversities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);

  const getUniversityList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/university");
      if (Array.isArray(response.data.data)) {
        setUniversities(response.data.data);
      } else {
        setUniversities([]);
      }
    } catch (err) {
      setError("Failed to load universities. Please try again.");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUniversityList();
  }, [getUniversityList]);

  const handleDeleteClick = (universityId) => {
    setSelectedUniversityId(universityId);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `/api/admin/university/${selectedUniversityId}/delete`
      );
      setOpenDialog(false);
      setSelectedUniversityId(null);
      getUniversityList();
    } catch (error) {
      console.error("Error deleting university:", error);
      setOpenDialog(false);
    }
  };

  const filteredUniversity = universities.filter((university) => {
    const query = searchQuery.toLowerCase();
    const status = university.status?.toLowerCase() || "";
    const matchesSearch =
      university.name.toLowerCase().includes(query) ||
      university.email.toLowerCase().includes(query) ||
      university.university?.address?.toLowerCase().includes(query) ||
      university.university?.contact_info?.toLowerCase().includes(query) ||
      status.includes(query);
    const matchesStatus =
      filterStatus === "" || status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const rows = filteredUniversity.map((u, index) => ({
    id: u.id,
    no: index + 1,
    name: u.name,
    email: u.email,
    status: u.status,
    address: u.university?.address || "",
    contact: u.university?.contact_info || "",
  }));

  const columns = [
    { field: "no", headerName: t("no"), width: 80 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1.2 },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            textTransform: "capitalize",
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
    { field: "address", headerName: t("address"), flex: 1.5 },
    { field: "contact", headerName: t("contact"), flex: 1 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <Link href={`/${locale}/admin/university/${params.row.id}`} passHref>
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

  const uniqueStatuses = [
    ...new Set(universities.map((u) => u.status).filter(Boolean)),
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
        <Typography ml={2}>Loading universities...</Typography>
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
      <Typography variant="h5" gutterBottom>
       {t("title")}
      </Typography>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        mb={2}
        justifyContent={"flex-end"}
      >
        <TextField
          variant="outlined"
          placeholder={t("search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
      </Box>

      <Box sx={{ height: 550, width: "100%", backgroundColor: "white" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("confirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
           {t("confirmText")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
           { t("cancel")}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
