"use client";
import {
  Box,
  Stack,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useTranslations } from "next-intl";

export default function CompanyList() {
  const { locale } = useParams();
  const t = useTranslations("admin_company");

  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const getCompanyList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/company");
      if (Array.isArray(response.data.data)) {
        setCompanies(response.data.data);
      } else {
        setCompanies([]);
        console.warn("Unexpected API format", response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load companies. Please try again.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCompanyList();
  }, [getCompanyList]);

  const openDeleteDialog = (companyId) => {
    setSelectedCompanyId(companyId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCompanyId(null);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/company/${selectedCompanyId}/delete`);
      getCompanyList();
    } catch (error) {
      console.error("Error deleting company:", error);
    } finally {
      closeDeleteDialog();
    }
  };

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return companies.filter((company) => {
      const status = company.status?.toLowerCase() || "";
      const matchSearch =
        company.name.toLowerCase().includes(query) ||
        company.email.toLowerCase().includes(query) ||
        company.company?.location?.toLowerCase().includes(query) ||
        company.company?.contact_info?.toLowerCase().includes(query) ||
        status.includes(query);

      const matchStatus =
        filterStatus === "" || status === filterStatus.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [companies, searchQuery, filterStatus]);

  const rows = filteredCompanies.map((company, index) => ({
    id: index + 1,
    realId: company.id,
    name: company.name,
    email: company.email,
    status: company.status,
    location: company.company?.location || "-",
    contact: company.company?.contact_info || "-",
  }));

  const columns = [
    { field: "id", headerName: t("no"), width: 70 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1 },
    {
      field: "status",
      headerName: t("status"),
      headerAlign: "center",
      align: "center",
      width: 120,
      renderCell: ({ value }) => (
        <Typography
          component={"span"}
          sx={{
            textTransform: "capitalize",
            fontSize: "14px",
            fontWeight: 600,
            color:
              value === "approved"
                ? "green"
                : value === "declined"
                ? "red"
                : "orange",
          }}
        >
          {value}
        </Typography>
      ),
    },
    { field: "location", headerName: t("location"), flex: 1 },
    { field: "contact", headerName: t("contact"), flex: 1 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 130,
      renderCell: ({ row }) => (
        <>
          <Link href={`/${locale}/admin/company/${row.realId}`} passHref>
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
        <Typography ml={2}>Loading companies...</Typography>
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

  const uniqueStatuses = [
    ...new Set(companies.map((c) => c.status).filter(Boolean)),
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
        <Typography variant="h5">{t("companies")}</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
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
        </Stack>
      </Box>

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

      {/* ==== Delete Confirmation Dialog ==== */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be
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
