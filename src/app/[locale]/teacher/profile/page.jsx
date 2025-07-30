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

export default function TeacherProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    department: "",
  });
  const [initialProfile, setInitialProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [initialImage, setInitialImage] = useState(null);
  const [error, setError] = useState("");

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
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/teacher/profile`);
        const teacher = res.data.teacher || {};

        // Map nested data to flat form fields
        const loadedProfile = {
          name: teacher.user?.name || "",
          department: teacher.department || "",
        };
        setProfile(loadedProfile);
        setInitialProfile(loadedProfile);

        const loadedImage = teacher.user?.image || null;
        setImage(loadedImage);
        setInitialImage(loadedImage);
      } catch (error) {
        console.error("Failed to fetch teacher profile", error);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      // Send the flat fields as expected by the backend PUT
      await axios.put(`/api/teacher/profile`, { ...profile, image });
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
      <Box boxShadow={3} width={400} p={3} borderRadius={2}>
        {/* Back Button */}
        <Button variant="outlined" sx={{ mb: 2 }} onClick={() => router.back()}>
          Back
        </Button>

        <Typography fontSize={24} fontWeight={700} mb={3}>
          Teacher Profile
        </Typography>

        <Box display="flex" justifyContent="center" mb={2}>
          <ImageUploadCircle
            label={"Teacher Profile"}
            image={image}
            setImage={setImage}
            size={64}
            showRemove={true}
          />
        </Box>
        <TextField
          label="Name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={saving}
        />
        <TextField
          label="Department"
          name="department"
          value={profile.department}
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
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            disabled={saving}
            fullWidth
          >
            Cancel
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
