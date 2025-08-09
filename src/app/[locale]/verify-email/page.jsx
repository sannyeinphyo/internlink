"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const { locale } = useParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleVerify = async () => {
    if (!otp || !email) {
      toast.error("Missing OTP or Email");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/verify-otp", { email, otp });
      toast.success(" Email had been verified successfully!");
      router.push(`/${locale}/login`);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is missing");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/resend-otp", { email });
      toast.success("OTP resent to your email");
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box
        sx={{
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body2" gutterBottom>
          We sent an OTP to: <strong>{email}</strong>
        </Typography>

        <TextField
          label="Enter OTP"
          fullWidth
          margin="normal"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Box display="flex" flexDirection="row" gap={2} mt={2}>
          <Button
            variant="outlined"
            onClick={handleResendOtp}
            disabled={loading || countdown > 0}
            sx={{ flex: 1 }}
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
          </Button>
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={loading}
            sx={{ flex: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : "Verify Email"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
