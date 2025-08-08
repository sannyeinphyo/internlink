"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Link as MuiLink,
  Stack,
  Paper,
  Divider,
  Grid,
  Button,
  Tooltip,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FacebookIcon from "@mui/icons-material/Facebook";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/Verified";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { ButtonOutline, ButtonPrimary } from "@/components/Button";

export default function CompanyProfilePage() {
  const { id, locale } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/student/view_company/${id}`);
        setCompany(res.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load company profile"
        );
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading)
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );

  if (error)
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );

  if (!company) return null;

  const verifiedRaw = company.verified;
  const isVerifiedBool = Boolean(verifiedRaw === true || verifiedRaw === 1);
  const isVerified = isVerifiedBool ? (
    <>
      <Tooltip title={"Email is verified"}>
        <VerifiedIcon
          sx={{ width: 16, height: 16, color: "green", m: "0 8px" }}
        />
        <Typography component={"span"} fontSize={"12px"}>
          verified
        </Typography>
      </Tooltip>
    </>
  ) : (
    <>
      <Tooltip title={"Email is not verified"}>
        <NewReleasesIcon
          sx={{ width: 16, height: 16, color: "red", m: "0 8px" }}
        />
        <Typography component={"span"}>unverified</Typography>
      </Tooltip>
    </>
  );
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/${locale}/jobs`)}
        sx={{ mb: 3 }}
      >
        Back to Jobs
      </Button>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Company Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Learn more about the company offering this internship and get in touch
        with the contact person.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          <Grid
            item
            xs={12}
            sm={4}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Avatar
              alt={company.name}
              src={company.image || "/default-company-logo.png"}
              sx={{ width: 140, height: 140, borderRadius: 2 }}
              variant="rounded"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {company.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {company.description || "No description provided."}
            </Typography>

            <Stack spacing={1} divider={<Divider flexItem />}>
              {company.website && (
                <MuiLink
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <LanguageIcon color="primary" /> {company.website}
                </MuiLink>
              )}

              {company.facebook && (
                <MuiLink
                  href={company.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <FacebookIcon color="primary" /> Facebook Page
                </MuiLink>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon color="action" />
                <Typography>{company.location}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon color="action" />
                <Typography>{company.contact_info}</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Contact Person
            </Typography>
            <Stack spacing={1} sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="action" />
                <Typography>{company.user.name}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon color="action" />
                <Typography>{company.user.email}</Typography>
              </Box>
              <Typography
                variant="body2"
                color={company.user.verified ? "green" : "error"}
              >
                {isVerified}
              </Typography>
            </Stack>

            <ButtonPrimary
              startIcon={<EmailIcon />}
              href={`mailto:${company.user.email}`}
            >
              Contact {company.user.name}
            </ButtonPrimary>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        {company.posts?.length > 0 && (
          <>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 6, mb: 2 }}>
              Internship Posts by {company.name}
            </Typography>

            <Grid container spacing={2}>
              {company.posts.map((post) => (
                <Grid item xs={12} md={6} key={post.id}>
                  <Paper
                    elevation={4}
                    sx={{ p: 3, borderRadius: 2, height: "100%" }}
                  >
                    <Stack spacing={1}  color="primary.main">
                      <Typography variant="h6" fontWeight="bold">
                        {post.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Job Type: {post.job_type || "N/A"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Location: {post.location || "N/A"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: post.paid ? "buttonmain.main" : "warning.main",
                          fontWeight: 500,
                        }}
                      >
                        {post.paid
                          ? `Paid Internship${
                              post.salary ? ` - ${post.salary} Ks` : ""
                            }`
                          : "Unpaid Internship"}
                      </Typography>

                      <ButtonOutline
                        size="small"
                        variant="outlined"
                        href={`/${locale}/jobs/${post.id}?backUrl=/${locale}/student/view_company/${company.id}`}
                        sx={{ mt: 2, alignSelf: "flex-start" }}
                      >
                        View Details
                      </ButtonOutline>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
}
