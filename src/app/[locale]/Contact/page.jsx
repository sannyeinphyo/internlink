"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { ButtonPrimary } from "@/components/Button";
import { useTranslations } from "next-intl";
import axios from "axios";

export default function ContactUs() {
  const t = useTranslations("contact_us");

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, success: true, message: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/mailbox", {
        ...form,
        user_id: null,
      });

      setSnack({ open: true, success: true, message: "Message sent successfully!" });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setSnack({
        open: true,
        success: false,
        message:
          err.response?.data?.error || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 4 },
        maxWidth: 900,
        mx: "auto",
        backgroundColor: "#f9fafb",
        borderRadius: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Typography
          variant="h3"
          fontWeight="700"
          gutterBottom
          sx={{ color: "buttonmain.main", textAlign: "center", mb: 2 }}
        >
          {t("header")}
        </Typography>
        <Typography
          variant="body1"
          mb={6}
          sx={{ color: "text.secondary", textAlign: "center", maxWidth: 700, mx: "auto" }}
        >
          {t("greeting")}
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 6,
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label={t("name")}
                fullWidth
                required
                value={form.name}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiInputLabel-root": { fontWeight: 600 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label={t("email")}
                fullWidth
                required
                type="email"
                value={form.email}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiInputLabel-root": { fontWeight: 600 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="message"
                label={t("message")}
                multiline
                rows={5}
                fullWidth
                required
                value={form.message}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiInputLabel-root": { fontWeight: 600 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ButtonPrimary
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Sending..." : t("send")}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={1}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "#e3f2fd",
            boxShadow: "none",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            📍 Our Office
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", lineHeight: 1.6, whiteSpace: "pre-line" }}
          >
            InternLink Headquarters{"\n"}
            No. 123, Tech Park Road, Yangon, Myanmar{"\n"}
            Phone: +95 9 123 456 789{"\n"}
            Email: support@internlink.com
          </Typography>
        </Paper>
      </motion.div>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
