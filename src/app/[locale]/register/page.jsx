"use client";

import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { registerSchema } from "@/schemas/validationSchemas";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";
import { IconButton, InputAdornment } from "@mui/material";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import ImageUploadCircle from "@/components/ImageUploadCircle";
import React from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("pending");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [image, setImage] = React.useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { locale } = useParams();

  const [batchYear, setBatchYear] = useState("");
  const [major, setMajor] = useState("");
  const [skills, setSkills] = useState([]);
  const [facebook, setFacebook] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [universities, setUniversities] = useState([]);
  const [universityId, setUniversityId] = useState("");

  const [companyLocation, setCompanyLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [facebookCompany, setFacebookCompany] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const [errors, setErrors] = useState({});

  const greetingt = useTranslations("greeting");
  const formt = useTranslations("formFields");

  const skillOptions = [
    "React",
    "Vue.js",
    "Angular",
    "Svelte",
    "Next.js",
    "Tailwind CSS",
    "Bootstrap",
    "JavaScript",
    "TypeScript",
    "CSS",
    "HTML",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Ruby on Rails",
    "Laravel",
    "Spring Boot",
    "ASP.NET",
    "PHP",
    "Python",
    "Java",
    "C#",
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name,
      email,
      password,
      role,
      status,
      image: image || null,
    };

    if (role === "student") {
      Object.assign(formData, {
        batch_year: batchYear ? parseInt(batchYear) : undefined,
        major,
        skills: skills.length ? skills : undefined,
        facebook,
        linkedIn,
        university_id: universityId ? parseInt(universityId) : undefined,
      });
    } else if (role === "company") {
      Object.assign(formData, {
        location: companyLocation,
        website: companyWebsite,
        facebook_company: facebookCompany,
        description: companyDescription,
        contact_info: contactInfo,
      });
    }

    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
    } catch (validationError) {
      if (validationError instanceof ValidationError) {
        const fieldErrors = {};
        validationError.inner.forEach((err) => {
          if (err.path) fieldErrors[err.path] = err.message;
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      } else {
        console.error(validationError);
        toast.error("Validation failed unexpectedly");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Registered successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setRole("student");
        setBatchYear("");
        setMajor("");
        setSkills([]);
        setFacebook("");
        setLinkedIn("");
        setUniversityId("");
        setCompanyLocation("");
        setCompanyWebsite("");
        setFacebookCompany("");
        setCompanyDescription("");
        setContactInfo("");
        setImage("");
        setErrors({});
        toast.success("OTP sent to your email!");
        router.push(`/${locale}/verify-email?email=${email}`);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("/api/university")
      .then((res) => setUniversities(res.data.universities))
      .catch(console.error);
  }, []);

  return (
    <Box>
      <Container
        maxWidth="lg"
        sx={{ mt: 8, display: "flex", padding: "2rem", gap: "2rem" }}
      >
        <Box
          flex={2}
          sx={{
            backgroundColor: "#f0f4ff",
            borderRadius: "0.75rem",
            padding: "2rem",
            boxShadow: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {greetingt("welcomeMessage")}
            
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {greetingt("introMessage")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 3 }}>
            {greetingt("studentFeatures")}
            <br />
            {greetingt("companyFeatures")}
          </Typography>
        </Box>

        <Paper
          elevation={4}
          sx={{
            padding: "2rem",
            flex: 4,
            borderRadius: "0.75rem",
          }}
        >
          <Typography variant="h4" gutterBottom textAlign={"center"}>
            {greetingt("registerButton")}
          </Typography>

          <Box
            component="form"
            onSubmit={handleRegister}
            noValidate
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <FormLabel>{greetingt("roleSelectionLabel")}</FormLabel>
            <RadioGroup
              row
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="student"
                control={<Radio />}
                label={greetingt("roles.student")}
              />
              <FormControlLabel
                value="company"
                control={<Radio />}
                label={greetingt("roles.company")}
              />
            </RadioGroup>

            <Box display="flex" gap={2} justifyContent={"center"}>
              <Box>
                <ImageUploadCircle
                  label={formt("profileImageUrl")}
                  image={image}
                  setImage={setImage}
                  error={errors?.image}
                  size={64}
                  showRemove={true}
                />
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label={
                  role === "company" ? `${formt("cname")}` : `${formt("name")}`
                }
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                label={formt("email")}
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label={formt("password")}
                fullWidth
                type={showPassword ? "text" : "password"}
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={!!errors.password}
                helperText={errors.password}
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

            {role === "student" && (
              <>
                <Box display="flex" gap={2}>
                  <TextField
                    label={formt("batchYear")}
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{
                      min: 1900,
                      max: new Date().getFullYear(),
                      step: 1,
                    }}
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    required
                    error={!!errors.batch_year}
                    helperText={errors.batch_year}
                  />
                  <FormControl
                    fullWidth
                    size="small"
                    required
                    error={!!errors.major}
                  >
                    <InputLabel id="major-label">{formt("major")}</InputLabel>
                    <Select
                      labelId="major-label"
                      value={major}
                      label={formt("major")}
                      onChange={(e) => setMajor(e.target.value)}
                    >
                      <MenuItem value="Computer Science">
                        Computer Science
                      </MenuItem>
                      <MenuItem value="Computer Technologies">
                        Computer Technologies
                      </MenuItem>
                    </Select>
                    <FormHelperText>{errors.major}</FormHelperText>
                  </FormControl>
                </Box>

                <Box display="flex" gap={2}>
                  <Box flex={1}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={skillOptions}
                      value={skills}
                      onChange={(event, newValue) => setSkills(newValue)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            sx={{
                              height: 25,
                              borderRadius: 1,
                              border: "1px solid blue",
                              backgroundColor: "#ebfffa",
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={formt("skills")}
                          size="small"
                          placeholder="Type and press enter..."
                          fullWidth
                          error={!!errors.skills}
                          helperText={errors.skills}
                        />
                      )}
                    />
                  </Box>
                  <Box flex={1} width={250}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={loading}
                      error={!!errors.university_id}
                      required
                    >
                      <InputLabel id="university-select-label">
                        {formt("university")}
                      </InputLabel>
                      <Select
                        labelId="university-select-label"
                        value={universityId}
                        label={formt("university")}
                        onChange={(e) => setUniversityId(e.target.value)}
                      >
                        {loading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        ) : universities.length === 0 ? (
                          <MenuItem disabled>No universities found</MenuItem>
                        ) : (
                          universities.map((uni) => (
                            <MenuItem key={uni.id} value={uni.id}>
                              {uni.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {!!errors.university_id && (
                        <Typography variant="caption" color="error">
                          {errors.university_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <TextField
                    label="Facebook URL"
                    fullWidth
                    size="small"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    error={!!errors.facebook}
                    helperText={errors.facebook}
                  />
                  <TextField
                    label="LinkedIn URL"
                    fullWidth
                    size="small"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    error={!!errors.linkedIn}
                    helperText={errors.linkedIn}
                  />
                </Box>
              </>
            )}

            {role === "company" && (
              <>
                <Box display="flex" gap={2}>
                  <TextField
                    label={formt("location")}
                    fullWidth
                    size="small"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    error={!!errors.location}
                    helperText={errors.location}
                    required
                  />
                  <TextField
                    label={formt("contact")}
                    fullWidth
                    size="small"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    error={!!errors.contact_info}
                    helperText={errors.contact_info}
                    required
                  />
                </Box>

                <Box display="flex" gap={2}>
                  <TextField
                    label={formt("website")}
                    fullWidth
                    size="small"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    error={!!errors.website}
                    helperText={errors.website}
                  />
                  <TextField
                    label="Facebook URL"
                    fullWidth
                    size="small"
                    value={facebookCompany}
                    onChange={(e) => setFacebookCompany(e.target.value)}
                    error={!!errors.facebook_company}
                    helperText={errors.facebook_company}
                  />
                </Box>

                <Box>
                  <TextField
                    label={formt("description")}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                </Box>
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 2,
                fontWeight: "bold",
                borderRadius: "8px",
                backgroundColor: "#6A38C2",
                "&:hover": {
                  backgroundColor: "#5529A3",
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
