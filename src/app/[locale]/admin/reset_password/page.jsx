"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PasswordReset() {
  const t = useTranslations("resetPassword");
  const { locale } = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const requestOtp = async () => {
    const toastId = toast.loading("Sending OTP...");
    try {
      const res = await axios.post("/api/request_reset", { email });
      toast.success(res.data.message || "OTP sent! Check your email.", {
        id: toastId,
      });
      setMessage(res.data.message);
      setStep(2);
    } catch (e) {
      toast.error(e.response?.data?.message || "Error sending OTP", {
        id: toastId,
      });
    }
  };

  const resetPassword = async () => {
    const toastId = toast.loading("Resetting password...");
    try {
      const res = await axios.post("/api/reset_password", {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful!", {
        id: toastId,
      });
      setMessage(res.data.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      router.push(`/${locale}/login`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Error resetting password", {
        id: toastId,
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {step === 1 ? t("resetPassword") : "Enter OTP"}
          </Typography>

          {step === 1 && (
            <>
              <TextField
                label={t("email")}
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => {
                    router.push(`/${locale}/admin/dashboard`);
                  }}
                  sx={{ flex: 1 }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={requestOtp}
                  sx={{ flex: 1 }}
                >
                  {t("send")}
                </Button>
              </Box>
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                label={t("enterotp")}
                type="text"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <TextField
                label={t("newpassword")}
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => {
                      router.push(`/${locale}/admin/dashboard`);
                  }}
                  sx={{ flex: 1 }}
                >
                  {t("cancel")}
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  onClick={resetPassword}
                  sx={{ flex: 1 }}
                >
                  {t("resetPassword")}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
}
