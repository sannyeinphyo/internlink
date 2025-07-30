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
import ConfirmDialogWithSnackbar from "@/components/MUIDialogbox";
import { useTranslations } from "next-intl";


export default function SettingsHomePage() {
  const { locale } = useParams();
  const router = useRouter();
  const t = useTranslations("company_setting")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/company/delete`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete company");

      setSnackbar({
        open: true,
        message: "Company deleted successfully",
        severity: "success",
      });
      setDeleteDialogOpen(false);

      router.push(`/${locale}/`);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete company",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const menuItems = [
  {
    id: "profile",
    label: t("profile_settings"),
    description: t("profile_settings_description"),
  },
  {
    id: "password",
    label: t("change_password"),
    description: t("change_password_description"),
  },
];

  return (
    <Box maxWidth={700} mx="auto" mt={5} px={2}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t("heading")}
        </Typography>
        <Typography variant="body1" mb={3}>
          {t("sub_heading")}
        </Typography>

        <List>
          {menuItems.map(({ id, label, description }) => (
            <Box key={id} mb={2}>
              <ListItemButton
                component={Link}
                href={`/${locale}/company/settings/${id}`}
                sx={{
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "rgba(101, 30, 223, 0.08)" },
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

        {/* Inline Delete Company Section */}
        <Box mt={6} borderTop="1px solid #ddd" pt={4}>
          <Typography variant="h6" fontWeight="bold" color="error" gutterBottom>
            {t("delete_company_account")}
          </Typography>
          <Typography variant="body2" mb={2}>
           {t("delete_company_account_description")}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("deletecompanny_button")
            )}
          </Button>
        </Box>

        <ConfirmDialogWithSnackbar
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title={t("confirm_delete")}
          message={t("message")}
          confirmText={t("confirm")}
          cancelText={t("cancel")}
          confirmColor="error"
          onConfirm={handleDeleteConfirm}
          loading={deleting}
          showSnackbar={true}
          snackbar={snackbar}
          onSnackbarClose={handleSnackbarClose}
        />
      </Paper>
    </Box>
  );
}
