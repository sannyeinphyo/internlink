"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const menuItems = [
  { id: "profile", label: "Profile Settings", description: "Update your teacher profile information." },
  { id: "password", label: "Change Password", description: "Update your account password securely." },
];

export default function SettingsHomePage() {
  const { locale } = useParams();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/teacher/delete`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete teacher account");

      setSnackbar({ open: true, message: "Teacher account deleted successfully", severity: "success" });
      setDeleteDialogOpen(false);
      router.push(`/${locale}/`);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || "Failed to delete teacher account", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box maxWidth={700} mx="auto" mt={5} px={2}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Teacher Settings
        </Typography>
        <Typography variant="body1" mb={3}>
          Manage your teacher account settings. Use the options below to update your profile or change your password.
        </Typography>

        <List>
          {menuItems.map(({ id, label, description }) => (
            <Box key={id} mb={2}>
              <ListItemButton
                component={Link}
                href={`/${locale}/teacher/settings/${id}`}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography fontWeight={600} color="primary">
                      {label}
                    </Typography>
                  }
                  secondary={description}
                />
              </ListItemButton>
              <Divider />
            </Box>
          ))}
        </List>

        {/* Delete Account Section */}
        <Box mt={6} borderTop="1px solid #ddd" pt={4}>
          <Typography variant="h6" fontWeight="bold" color="error" gutterBottom>
            Delete Teacher Account
          </Typography>
          <Typography variant="body2" mb={2} color="text.secondary">
            Warning: This action is irreversible. Deleting your teacher account will permanently remove all related data.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteClick}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} color="error" /> : "Delete Account"}
          </Button>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete your teacher account? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
              {deleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
