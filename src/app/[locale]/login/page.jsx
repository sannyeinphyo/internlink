"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Typewriter } from "react-simple-typewriter";
export default function LoginPage() {
  const t = useTranslations("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { locale } = useParams();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  const loadingToast = toast.loading(t("loading"));
  const res = await signIn("credentials", {
    redirect: false,
    identifier,
    password,
  });
  toast.dismiss(loadingToast);
  if (res.ok) {
    toast.success(t("success"));
  } else {
    toast.error(t("wrong"));
  }
};


useEffect(() => {
  if (status === "authenticated") {
    const role = session.user.role;
    router.push(`/${locale}/${role === "student" ? "dashboard" : `${role}/dashboard`}`);
  }
}, [status, session, router, locale]);


  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          px: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          gap: 6,
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: 500,
            textAlign: { xs: "center", md: "left" },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="#ea9635ff" gutterBottom>
            <Typewriter
              words={[t("welcome")]}
              loop={1}
              cursor
              cursorStyle="_"
              typeSpeed={100}
              deleteSpeed={50}
              delaySpeed={1000}
            />
            👋
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {t("greeting")}
          </Typography>
        </Box>

        <Box
          component={Paper}
          elevation={6}
          sx={{
            flex: 1,
            maxWidth: 420,
            borderRadius: 3,
            px: 5,
            py: 6,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h4" textAlign="center" fontWeight="700" >
            {t("login")}
          </Typography>

          {error && (
            <Typography color="error" textAlign="center" fontWeight="600">
              {error}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label={t("email")}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              fullWidth
              autoComplete="username"
              variant="outlined"
              size="medium"
            />

            <TextField
              label={t("password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              variant="outlined"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography
              variant="body2"
              sx={{ textAlign: "right", mt: -1.5, mb: 1 }}
            >
              <Button
                onClick={() => router.push(`/${locale}/reset_password`)}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "primary.main",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {t("forgetpassword") || "Forgot password?"}
              </Button>
            </Typography>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.6,
                fontWeight: 600,
                letterSpacing: 0.5,
                borderRadius: 2,
                bgcolor: "buttonmain.main",
                boxShadow: "0 3px 8px rgba(107, 56, 194, 0.5)",
                "&:hover": {
                  bgcolor: "buttonmain.dark",
                  boxShadow: "0 4px 12px rgba(107, 56, 194, 0.7)",
                },
              }}
            >
              {t("login")}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            {t("noaccount")}
            <Button
              onClick={() => router.push(`/${locale}/register`)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {t("Signup")}
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
