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
import { useTranslations } from "next-intl";

export default function ReviewAccountsPage() {
  const { locale } = useParams();
  const t = useTranslations("review");
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
    { field: "no", headerName: t("no"), width: 70 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1 },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: getStatusColor(params.value), fontWeight: 600 }}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </span>
      ),
    },
    ...(selectedRole === "company"
      ? [
          { field: "location", headerName: t("location"), flex: 1 },
          { field: "contact_info", headerName: t("contact_info"), flex: 1 },
        ]
      : [
          { field: "university", headerName: t("university"), flex: 1 },
          { field: "batch_year", headerName: t("batch_year"), flex: 1 },
          { field: "major", headerName: t("major"), flex: 1 },
        ]),
    {
      field: "actions",
      headerName: t("actions"),
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
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">{t("title")}</Typography>
        <Button
          onClick={handleMenuClick}
          variant="contained"
          endIcon={<ArrowDropDownIcon />}
        >
          {selectedRole === "company" ? t("companies") : t("students")}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleMenuItemClick("company")}>{t("companies")}</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick("student")}>{t("students")}</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ height: 550, width: "100%", backgroundColor: "white" }}>
        <DataGrid rows={rows} columns={columns} pageSize={10} disableRowSelectionOnClick />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("delete_warning")}</DialogContentText>
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