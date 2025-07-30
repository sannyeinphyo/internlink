"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Stack,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      setAdmin(data.admin);
      setPreview(data.admin.image);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setAdmin((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: admin.name,
        email: admin.email,
        image: admin.image || null,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setAdmin(data.admin);
      setPreview(data.admin.image);
      setIsEditing(false);
    } else {
      alert("Failed to update: " + data.message);
    }
  };

  if (loading || !admin) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="600px" mx="auto" mt={6}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Admin Profile
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Avatar
              src={preview}
              alt="Admin Avatar"
              sx={{ width: 80, height: 80 }}
            />
            {isEditing && (
              <Button component="label" variant="outlined" size="small">
                Upload Photo
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            )}
          </Stack>

          <TextField
            fullWidth
            label="Name"
            name="name"
            value={admin.name}
            onChange={handleChange}
            disabled={!isEditing}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={admin.email}
            onChange={handleChange}
            disabled={!isEditing}
            margin="normal"
          />
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          {isEditing ? (
            <>
              <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 1 }}>
                Save
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
}
