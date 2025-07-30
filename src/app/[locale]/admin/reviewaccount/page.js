// ReviewAccountsPage with MUI DataGrid and Dialog for deletion confirmation
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ReviewAccountsPage() {
  const { locale } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState("company");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuItemClick = (role) => {
    setSelectedRole(role);
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "declined":
        return "red";
      default:
        return "inherit";
    }
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/admin/reviewaccount?role=${selectedRole}`);
      setAccounts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (locale) fetchAccounts();
  }, [fetchAccounts, locale]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/reviewaccount/${selectedId}/delete`);
      fetchAccounts();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  const rows = accounts.map((acc, i) => ({
    id: acc.id,
    no: i + 1,
    name: acc.name,
    email: acc.email,
    status: acc.status,
    location: acc.company?.location || "N/A",
    contact_info: acc.company?.contact_info || "N/A",
    university: acc.student?.university?.name || "N/A",
    batch_year: acc.student?.batch_year || "N/A",
    major: acc.student?.major || "N/A",
  }));

  const columns = [
    { field: "no", headerName: "No", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: getStatusColor(params.value), fontWeight: 600 }}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </span>
      ),
    },
    ...(selectedRole === "company"
      ? [
          { field: "location", headerName: "Location", flex: 1 },
          { field: "contact_info", headerName: "Contact Info", flex: 1 },
        ]
      : [
          { field: "university", headerName: "University", flex: 1 },
          { field: "batch_year", headerName: "Batch Year", flex: 1 },
          { field: "major", headerName: "Major", flex: 1 },
        ]),
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <>
          <Link href={`/${locale}/admin/reviewaccount/${params.row.id}`} passHref>
            <IconButton>
              <VisibilityIcon sx={{ color: "blue" }} />
            </IconButton>
          </Link>
        </>
      ),
    },
  ];

  if (!locale || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography ml={2}>Loading accounts...</Typography>
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
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Admin Account Review</Typography>
        <Button
          onClick={handleMenuClick}
          variant="contained"
          endIcon={<ArrowDropDownIcon />}
        >
          {selectedRole === "company" ? "Companies" : "Students"}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleMenuItemClick("company")}>Companies</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick("student")}>Students</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ height: 550, width: "100%", backgroundColor: "white" }}>
        <DataGrid rows={rows} columns={columns} pageSize={10} disableRowSelectionOnClick />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this account?
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