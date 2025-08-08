"use client";

import {
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import ImageUploadCircle from "@/components/ImageUploadCircle";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
export default function UniversityProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    website: "",
    address: "",
    contact_info: "",
  });
  const [initialProfile, setInitialProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [initialImage, setInitialImage] = useState(null);
  const [error, setError] = useState("");
  const t = useTranslations("uni-profile")

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchUniversityProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/university/profile`);
        const university = res.data.university || {};

        const loadedProfile = {
          name: university.user?.name || "",
          website: university.website || "",
          address: university.address || "",
          contact_info: university.contact_info || "",
        };
        setProfile(loadedProfile);
        setInitialProfile(loadedProfile);

        const loadedImage = university.user?.image || null;
        setImage(loadedImage);
        setInitialImage(loadedImage);
      } catch (error) {
        console.error("Failed to fetch university profile", error);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUniversityProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.put(`/api/university/profile`, { ...profile, image });
      showSnackbar("Profile updated successfully!", "success");
      setInitialProfile(profile);
      setInitialImage(image);
    } catch (error) {
      console.error("Failed to save profile", error);
      setError("Failed to save profile.");
      showSnackbar("Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setImage(initialImage);
    setError("");
    handleSnackbarClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display={"flex"} justifyContent={"center"} p={6}>
      <Box boxShadow={3} width={900} p={3} borderRadius={2}>
        <Button variant="outlined" sx={{ mb: 2 }} onClick={() => router.back()}>
         {t("back")}
        </Button>

        <Typography fontSize={24} fontWeight={700} mb={3}>
          {t("title")}
        </Typography>

        <Box display="flex" justifyContent="center" mb={2}>
          <ImageUploadCircle
            label={"University Profile"}
            image={image}
            setImage={setImage}
            size={120}
            showRemove={true}
            borderRadius="0"
          />
        </Box>
        <TextField
          label="University Name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={saving}
        />
        <TextField
          label="Website"
          name="website"
          value={profile.website}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={saving}
        />
        <TextField
          label="Address"
          name="address"
          value={profile.address}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={saving}
        />
        <TextField
          label="Contact Info"
          name="contact_info"
          value={profile.contact_info}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={saving}
        />
        {error && (
          <Typography color="error" variant="body2" mt={1}>
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            fullWidth
          >
            {saving ? "Saving..." : t("save")}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            disabled={saving}
            fullWidth
          >
            {t("cancel")}
          </Button>
        </Stack>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
