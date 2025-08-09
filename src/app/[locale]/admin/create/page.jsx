"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormHelperText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useTranslations } from "next-intl";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { combinedAccountSchema } from "@/schemas/adminAccountCreation";

const ROLES = [
  { value: "company", label: "Company" },
  { value: "university", label: "University" },
];

export default function CreateAccount() {
  const t = useTranslations("admin_create");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(combinedAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      address: "",
      location: "",
      contact_info: "",
      website: "",
      facebook: "",
      description: "",
      status: "approved",
    },
  });

  const selectedRole = watch("role");
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      console.log("Form Data Submitted:", formData);

      const bodyData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.location && { location: formData.location }),
        ...(formData.address && { address: formData.address }),
        ...(formData.contact_info && { contact_info: formData.contact_info }),
        ...(formData.website && { website: formData.website }),
        ...(formData.facebook && { facebook: formData.facebook }),
        ...(formData.description && { description: formData.description }),
        status: formData.status,
      };

      let apiPath;
      if (formData.role === "company") {
        apiPath = "/api/admin/company";
      } else if (formData.role === "university") {
        apiPath = "/api/admin/university";
      } else {
        throw new Error("Invalid role selected. Please choose a role.");
      }

      const response = await axios.post(apiPath, bodyData);

      if (response.status >= 200 && response.status < 300) {
        toast.success(
          response.data.message || "Account created successfully! 🎉"
        );
        reset({
          name: "",
          email: "",
          password: "",
          role: "",
          address: "",
          location: "",
          contact_info: "",
          website: "",
          facebook: "",
          description: "",
          status: "approved",
        });
      } else {
        toast.error(
          response.data.message || "Something went wrong during creation."
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Server error or network issue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: "",
      email: "",
      password: "",
      role: "",
      address: "",
      location: "",
      contact_info: "",
      website: "",
      facebook: "",
      description: "",
      status: "approved",
    });
    toast("Form has been reset.");
  };

  useEffect(() => {
    reset((prev) => ({
      ...prev,
      address: "",
      location: "",
      contact_info: "",
      website: "",
      facebook: "",
      description: "",
    }));
  }, [selectedRole, reset]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffff" }}>
      <Typography variant="h5" mb={2}>
        Create Company/University Account
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" sx={{ p: 2 }} onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex">
            <TextField
              label={t("name")}
              fullWidth
              sx={{ mb: 2, mr: 2 }}
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
            />
            <TextField
              label={t("email")}
              fullWidth
              sx={{ mb: 2 }}
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              required
            />
          </Box>

          <Box width="100%" mb={2} size="medium">
            <TextField
              label={t("password")}
              fullWidth
              type={showPassword ? "text" : "password"}
              size="medium"
              {...register("password")}
              helperText={errors.password?.message}
              required
              error={!!errors.password}
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
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.role}>
            <InputLabel id="role-label">{t("role")}</InputLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="role-label"
                  label="Role"
                  value={field.value || ""}
                >
                  {ROLES.map((role, index) => (
                    <MenuItem key={index} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.role?.message}</FormHelperText>
          </FormControl>

          {selectedRole && (
            <>
              <Box display="flex">
                <TextField
                  label={t("website")}
                  fullWidth={
                    selectedRole === "company" || selectedRole === "university"
                  }
                  sx={{ mb: 2, mr: selectedRole === "company" ? 2 : 0 }}
                  {...register("website")}
                  error={!!errors.website}
                  helperText={errors.website?.message}
                />

                {selectedRole === "company" && (
                  <TextField
                    label={t("facebook_url")}
                    fullWidth
                    sx={{ mb: 2 }}
                    {...register("facebook")}
                    error={!!errors.facebook}
                    helperText={errors.facebook?.message}
                  />
                )}
              </Box>

              <Box display="flex">
                {selectedRole === "company" && (
                  <TextField
                    label={t("location")}
                    fullWidth
                    sx={{ mb: 2, mr: 2 }}
                    {...register("location")}
                    error={!!errors.location}
                    helperText={errors.location?.message}
                    required
                  />
                )}
                {selectedRole === "university" && (
                  <TextField
                    label={t("address")}
                    fullWidth
                    sx={{ mb: 2, mr: 2 }}
                    {...register("address")}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    required
                  />
                )}

                <TextField
                  label={t("contact_info")}
                  fullWidth
                  sx={{ mb: 2 }}
                  {...register("contact_info")}
                  error={!!errors.contact_info}
                  helperText={errors.contact_info?.message}
                  required
                />
              </Box>

              {selectedRole === "company" && (
                <TextField
                  label={t("description")}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  {...register("description")}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  required
                />
              )}
            </>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : t("create")}
            </Button>
            <Button
              variant="contained"
              type="button"
              sx={{ bgcolor: "red" }}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
