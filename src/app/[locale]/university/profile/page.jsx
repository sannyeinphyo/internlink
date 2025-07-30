"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  TextField,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ImageUploadCircle from "@/components/ImageUploadCircle";
export default function UniversityProfilePage() {
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch("/api/university/profile")
      .then((res) => res.json())
      .then((data) => {
        setUniversity(data.university);
        setPreview(data.university?.user.image || null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!university) {
    return (
      <Typography color="error" mt={5} align="center">
        Failed to load university profile.
      </Typography>
    );
  }

  const handleChange = (e) => {
    setUniversity({
      ...university,
      user: { ...university.user, [e.target.name]: e.target.value },
    });
  };

  const handleFieldChange = (field) => (e) => {
    setUniversity({ ...university, [field]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setUniversity((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          image: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const res = await fetch("/api/university/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: university.user.name,
        email: university.user.email,
        image: university.user.image,
        contact_info: university.contact_info,
        address: university.address,
        website: university.website,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setUniversity(data.university);
      setPreview(data.university.user.image);
      setIsEditing(false);
    } else {
      alert("Failed to update: " + data.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreview(university.user.image);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={5}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2} gap={2}>
            <Tooltip title="University Profile">
            <Box sx={{ width: 72, height: 72 }} border={"1px solid #f5f5f5"} padding={1} borderRadius={"8px"}>
              <img src={preview} />
            </Box>
            </Tooltip>

            {isEditing && (
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCamera />}
              >
                Upload
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                />
              </Button>
            )}
          </Box>

          {isEditing ? (
            <>
              <TextField
                label="Name"
                name="name"
                value={university.user.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="email"
                value={university.user.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Contact Info"
                value={university.contact_info || ""}
                onChange={handleFieldChange("contact_info")}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Address"
                value={university.address || ""}
                onChange={handleFieldChange("address")}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Website"
                value={university.website || ""}
                onChange={handleFieldChange("website")}
                fullWidth
                margin="normal"
              />
            </>
          ) : (
            <>
              <Typography variant="h5">{university.user.name}</Typography>
              <Typography color="text.secondary">
                {university.user.email}
              </Typography>
              <Typography mt={2}>
                <strong>Contact Info:</strong>{" "}
                {university.contact_info || "N/A"}
              </Typography>
              <Typography mt={1}>
                <strong>Address:</strong> {university.address || "N/A"}
              </Typography>
              <Typography mt={1}>
                <strong>Website:</strong>{" "}
                {university.website ? (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {university.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </Typography>
            </>
          )}
        </CardContent>

        <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
}
