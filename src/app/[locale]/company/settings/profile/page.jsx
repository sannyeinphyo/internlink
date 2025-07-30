"use client";

import {
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import ImageUploadCircle from "@/components/ImageUploadCircle";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    website: "",
    description: "",
    location: "",
    contact_info: "",
    facebook: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/company/profile`);
        const data = res.data.data || {};
        setProfile({
          name: data.name || "",
          website: data.website || "",
          description: data.description || "",
          location: data.location || "",
          contact_info: data.contact_info || "",
          facebook: data.facebook || "",
        });
        setImage(data.image || null);
      } catch (error) {
        console.error("Failed to fetch company profile", error);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.put(`/api/company/profile`, { ...profile, image });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to save profile", error);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
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
        <Typography fontSize={24} fontWeight={700} mb={3}>
          Company Profile
        </Typography>

        <Box display="flex" justifyContent="center" mb={2}>
          <ImageUploadCircle
            label={"Company Profile"}
            image={image}
            setImage={setImage}
            size={64}
            showRemove={true}
          />
        </Box>

        <TextField
          label="Company Name"
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
          label="Description"
          name="description"
          value={profile.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          disabled={saving}
        />

        <TextField
          label="Location"
          name="location"
          value={profile.location}
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

        <TextField
          label="Facebook"
          name="facebook"
          value={profile.facebook}
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

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={handleSave}
          disabled={saving}
          fullWidth
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Box>
  );
}
