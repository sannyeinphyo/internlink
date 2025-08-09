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
  Autocomplete,
  Chip,
  FormLabel,
  Tooltip,
} from "@mui/material";

import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { combinedUniversityAccountSchema } from "@/schemas/universityCreateAccount";

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

const ROLES = [
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
];

const MAJORS = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Computer Technology", label: "Computer Technology" },
];

export default function UniversityCreateAccount() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityName, setUniversityName] = useState("Loading University...");
  const t = useTranslations("university_create");
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(combinedUniversityAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      university_id: "",
      department: "",
      batch_year: "",
      major: "",
      skills: [],
      facebook: "",
      linkedIn: "",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const currentUserId = session.user.id;

      const fetchUniversityName = async () => {
        try {
          const response = await axios.get(
            `/api/university/get-university-name/${currentUserId}`
          );

          if (
            response.status === 200 &&
            response.data?.name &&
            response.data?.id
          ) {
            setUniversityName(response.data.name);
            setValue("university_id", response.data.id);
          } else {
            setUniversityName("Error loading name");
            toast.error(t("fetch_fail"));
          }
        } catch (error) {
          setUniversityName("Error loading name");
          toast.error(t("fetch_fail"));
        }
      };

      fetchUniversityName();
    } else if (status === "unauthenticated") {
      setUniversityName(t("unauthorized"));
    }
  }, [status, session, setValue, t]);

  useEffect(() => {
    reset((prev) => ({
      ...prev,
      department: "",
      batch_year: "",
      major: "",
      skills: [],
      facebook: "",
      linkedIn: "",
      student_id_image: "",
    }));
  }, [selectedRole, reset]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const skillsString =
        formData.skills && formData.skills.length > 0
          ? formData.skills.join(", ")
          : "";

      const bodyData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        university_id: parseInt(formData.university_id, 10),
        ...(formData.department && { department: formData.department }),
        ...(formData.batch_year && {
          batch_year: parseInt(formData.batch_year, 10),
        }),
        ...(formData.major && { major: formData.major }),
        ...(skillsString && { skills: skillsString }),
        ...(formData.facebook && { facebook: formData.facebook }),
        ...(formData.linkedIn && { linkedIn: formData.linkedIn }),
        student_id_image: formData.student_id_image,
        status: "approved",
      };

      let apiPath;
      if (formData.role === "teacher") apiPath = "/api/university/teacher";
      else if (formData.role === "student") apiPath = "/api/university/student";
      else throw new Error(t("invalid_role"));

      const response = await axios.post(apiPath, bodyData);

      if (response.status >= 200 && response.status < 300) {
        toast.success(t("success"));
        reset();
      } else {
        toast.error(t("creation_fail"));
      }
    } catch (err) {
      toast.error(err.message || t("unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("Current form values:", watch());

  const handleCancel = () => {
    reset();
    toast(t("form_reset"));
  };

  if (status === "loading") {
    return <Typography>{t("loading_session")}</Typography>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "university") {
    return (
      <Typography color="error" variant="h6" sx={{ p: 3 }}>
        {t("not_authorized")}
      </Typography>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", p: 3 }}>
      <Typography variant="h5" mb={2}>
        {t("title")}
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" sx={{ p: 2 }} onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label={t("name")}
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label={t("email")}
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            </Box>

            {/* <TextField
            label={t("password")}
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          /> */}
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
                  label={t("role")}
                  value={field.value || ""}
                >
                  {ROLES.map((role, index) => (
                    <MenuItem key={index} value={role.value}>
                      {t(role.value)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.role?.message}</FormHelperText>
          </FormControl>

          <TextField
            label={t("universityName")}
            fullWidth
            sx={{ mb: 2 }}
            value={universityName}
            InputProps={{ readOnly: true }}
            error={!!errors.university_id}
            helperText={errors.university_id?.message}
          />

          {selectedRole === "teacher" && (
            <TextField
              select
              label={t("department")}
              fullWidth
              sx={{ mb: 2 }}
              {...register("department")}
              error={!!errors.department}
              helperText={errors.department?.message}
            >
              {[
                "Computer Science",
                "Information Technology",
                "Business",
                "Engineering",
              ].map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          )}

          {selectedRole === "student" && (
            <>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label={t("batchYear")}
                  fullWidth
                  type="number"
                  {...register("batch_year")}
                  error={!!errors.batch_year}
                  helperText={errors.batch_year?.message}
                />
                <FormControl fullWidth error={!!errors.major}>
                  <InputLabel id="major-label">{t("major")}</InputLabel>
                  <Controller
                    name="major"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="major-label"
                        label={t("major")}
                        value={field.value || ""}
                      >
                        {MAJORS.map((major, index) => (
                          <MenuItem key={index} value={major.value}>
                            {major.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>{errors.major?.message}</FormHelperText>
                </FormControl>
              </Box>

              <Controller
                name="skills"
                control={control}
                defaultValue={[]}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    freeSolo
                    options={skillOptions}
                    value={value || []}
                    onChange={(_, data) => onChange(data)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option}
                          label={option}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("skills")}
                        placeholder={t("skillsPlaceholder")}
                        error={!!errors.skills}
                        helperText={errors.skills?.message}
                      />
                    )}
                  />
                )}
              />

              <Box display="flex" gap={2} mt={2}>
                <TextField
                  label={t("facebook")}
                  fullWidth
                  {...register("facebook")}
                  error={!!errors.facebook}
                  helperText={errors.facebook?.message}
                />
                <TextField
                  label={t("linkedIn")}
                  fullWidth
                  {...register("linkedIn")}
                  error={!!errors.linkedIn}
                  helperText={errors.linkedIn?.message}
                />
              </Box>
              <Controller
                name="student_id_image"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Tooltip title={t("upload_student_id_tooltip")}>
                    <Box mt={2}>
                      <FormLabel>Upload Student ID</FormLabel>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              field.onChange(reader.result);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            field.onChange("");
                          }
                        }}
                      />
                      <label
                        htmlFor="upload-file"
                        style={{
                          fontWeight: "bold",
                          margin: "10px",
                          display: "inline-block",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#6e0faaff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#363636ff")
                        }
                      >
                        Upload Your Student Id
                      </label>

                      {field.value && (
                        <img
                          src={field.value}
                          alt="Student ID Preview"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "contain",
                            marginTop: "10px",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                )}
              />
            </>
          )}

          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("creating") : t("create")}
            </Button>
            <Button
              variant="outlined"
              type="button"
              color="error"
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
