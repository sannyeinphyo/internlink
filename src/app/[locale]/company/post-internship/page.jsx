"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { ButtonPrimary } from "@/components/Button";
import { useTranslations } from "next-intl";

export default function CreateInternshipPost() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    paid: false,
    salary: "",
    location: "",
    start_date: "",
    end_date: "",
    job_type: "",
    application_deadline: "",
    benefits: "",
    contact_email: "",
    remote: false,
    positions: "",
    responsibilities: "",
  });

  const t = useTranslations("internshipPost");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        salary: formData.paid ? Number(formData.salary) : null,
        positions: Number(formData.positions),
      };
      await axios.post("/api/company/posts", payload);
      toast.success("Internship post created successfully!");
      setFormData({
        title: "",
        description: "",
        requirements: "",
        paid: false,
        salary: "",
        location: "",
        start_date: "",
        end_date: "",
        job_type: "",
        application_deadline: "",
        benefits: "",
        contact_email: "",
        remote: false,
        positions: "",
        responsibilities: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    }
  };

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto", p: 3 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "#fafafa",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {t("header")}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t("subHeader")}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Section title={t("sections.basicInfo")}>
              <FlexRow>
                <TextField
                  label={t("fields.title")}
                  name="title"
                  required
                  fullWidth
                  sx={{ flex: 1 }}
                  value={formData.title}
                  onChange={handleChange}
                />
                <TextField
                  label={t("fields.jobType")}
                  name="job_type"
                  fullWidth
                  sx={{ flex: 1 }}
                  value={formData.job_type}
                  onChange={handleChange}
                />
              </FlexRow>
              <TextField
                label={t("fields.description")}
                name="description"
                required
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Section>

            <Section title={t("sections.expectations")}>
              <FlexRow>
                <TextField
                  label={t("fields.responsibilities")}
                  name="responsibilities"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ flex: 1 }}
                  value={formData.responsibilities}
                  onChange={handleChange}
                />
                <TextField
                  label={t("fields.requirements")}
                  name="requirements"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ flex: 1 }}
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </FlexRow>
            </Section>

            <Section title={t("sections.salaryWorkMode")}>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="paid"
                      checked={formData.paid}
                      onChange={handleChange}
                    />
                  }
                  label={t("fields.paid")}
                />
                {formData.paid && (
                  <TextField
                    label={t("fields.salary")}
                    name="salary"
                    type="number"
                    required
                    sx={{ minWidth: 200 }}
                    onChange={handleChange}
                  />
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="remote"
                      checked={formData.remote}
                      onChange={handleChange}
                    />
                  }
                  label={t("fields.remote")}
                />
              </Box>
            </Section>

            <Section title={t("sections.scheduleLocation")}>
              <FlexRow>
                <TextField
                  label={t("fields.location")}
                  name="location"
                  fullWidth
                  sx={{ flex: 1 }}
                  value={formData.location}
                  onChange={handleChange}
                />
                <TextField
                  label={t("fields.positions")}
                  name="positions"
                  type="number"
                  fullWidth
                  sx={{ flex: 1 }}
                  value={formData.positions}
                  onChange={handleChange}
                />
              </FlexRow>

              <FlexRow>
                <TextField
                  label={t("fields.startDate")}
                  name="start_date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                  value={formData.start_date}
                  onChange={handleChange}
                />
                <TextField
                  label={t("fields.endDate")}
                  name="end_date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                  value={formData.end_date}
                  onChange={handleChange}
                />
                <TextField
                  label={t("fields.applicationDeadline")}
                  name="application_deadline"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                  value={formData.application_deadline}
                  onChange={handleChange}
                />
              </FlexRow>
            </Section>

            <Section title={t("sections.additionalInfo")}>
              <FlexRow>
                <TextField
                  label={t("fields.benefits")}
                  name="benefits"
                  fullWidth
                  sx={{ flex: 1 }}
                  value={formData.benefits}
                  onChange={handleChange}
                />
                <TextField
                  label={t("fields.contactEmail")}
                  name="contact_email"
                  type="email"
                  fullWidth
                  sx={{ flex: 1 }}
                  value={formData.contact_email}
                  onChange={handleChange}
                />
              </FlexRow>
            </Section>

            <ButtonPrimary
              type="submit"
              variant="contained"
              size="large"
              fullWidth
            >
              {t("submitButton")}
            </ButtonPrimary>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

function FlexRow({ children }) {
  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      {children}
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 3,
        p: 3,
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 2, color: "#1976d2" }}
      >
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}
