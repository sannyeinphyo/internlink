"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Slide,
  Fade,
} from "@mui/material";

// Slide transition for Snackbar
const SlideUp = (props) => {
  return <Slide {...props} direction="up" />;
};

// Fade transition for Dialog
const FadeTransition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

export default function ConfirmDialogWithSnackbar({
  open,
  onClose,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  showSnackbar = false,
  snackbar = { open: false, message: "", severity: "info" },
  onSnackbarClose = () => {},
  confirmColor,
}) {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={FadeTransition}
        keepMounted
        PaperProps={{
          sx: {
            borderRadius: 3,
            paddingX: 2,
            paddingY: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
          }}
        >
          {title}
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ fontSize: "1rem", color: "#555" }}>
            {message}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            color={confirmColor}
            disabled={loading}
            variant="contained"
            sx={{ borderRadius: 2, boxShadow: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      {showSnackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={onSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={SlideUp}
        >
          <Alert
            onClose={onSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%", fontSize: "0.95rem" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
