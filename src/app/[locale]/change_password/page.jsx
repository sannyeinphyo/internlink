"use client";
import React, { useState } from "react";
import axios from "axios";
import { TextField, Box, Button, Stack } from "@mui/material";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/change_password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password Reset Successful")
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Error changing password ")
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      width={"100%"}
      height={"100vh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack spacing={2} width="300px">
        <TextField
          type="password"
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button
          variant="contained"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Password"}
        </Button>
      </Stack>
    </Box>
  );
}
