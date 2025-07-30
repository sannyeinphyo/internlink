"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Avatar,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import BusinessIcon from "@mui/icons-material/Business";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCompanyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/admin/company/${id}`);
        if (response.data?.data) {
          setCompany(response.data.data);
        } else {
          setError("Company data not found in response.");
        }
      } catch (err) {
        console.error("Error fetching company details:", err);
        setError("Failed to load company details. Please try again or check the ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Loading company details...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  // If no company found (edge case)
  if (!company) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Typography variant="h6">Company not found.</Typography>
        <Button
          variant="contained"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  // Destructure user-level and company-level info
  const { name, email, image, status, verified } = company;
  const companyProfile = company.company;

  return (
    <Box sx={{ p: 4 }}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" mb={4}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          startIcon={<KeyboardBackspaceIcon />}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          Company Details
        </Typography>
      </Stack>

      {/* Main content card */}
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto", borderRadius: 2 }}>
        {/* Company avatar and basic info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={image || ""}
            sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}
          >
            {!image && (name ? name[0].toUpperCase() : <BusinessIcon sx={{ fontSize: 40 }} />)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mt={0.5}>
              {email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Company status and verification */}
        <Stack spacing={2}>
          <Typography variant="body1">
            <strong>Status:</strong>{" "}
            <Box
              component="span"
              sx={{
                color:
                  status === "pending"
                    ? "orange"
                    : status === "approved"
                    ? "green"
                    : status === "declined"
                    ? "red"
                    : "inherit",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {status}
            </Box>
          </Typography>
          <Typography variant="body1">
            <strong>Verified:</strong> {verified ? "Yes" : "No"}
          </Typography>

          {/* Detailed company profile info if exists */}
          {companyProfile ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Company Specifics:
              </Typography>

              <Typography variant="body1">
                <strong>Company Name:</strong> {companyProfile.name || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Location:</strong> {companyProfile.location || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Contact Info:</strong> {companyProfile.contact_info || "N/A"}
              </Typography>
              {companyProfile.description && (
                <Typography variant="body1">
                  <strong>Description:</strong> {companyProfile.description}
                </Typography>
              )}
              {companyProfile.website && (
                <Typography variant="body1">
                  <strong>Website:</strong>{" "}
                  <a href={companyProfile.website} target="_blank" rel="noopener noreferrer">
                    {companyProfile.website}
                  </a>
                </Typography>
              )}
              {companyProfile.facebook && (
                <Typography variant="body1">
                  <strong>Facebook:</strong>{" "}
                  <a href={companyProfile.facebook} target="_blank" rel="noopener noreferrer">
                    {companyProfile.facebook}
                  </a>
                </Typography>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No detailed company profile found for this user.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
