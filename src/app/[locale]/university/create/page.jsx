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
} from "@mui/material";

import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useSession } from "next-auth/react";

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
  const [universityName, setUniversityName] = useState("Loading University..."); // State to hold the current university name

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
      skills: [], // Initialize skills as an empty array to match Autocomplete's default
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
            toast.error("Failed to fetch university name or ID.");
          }
        } catch (error) {
          setUniversityName("Error loading name");
          toast.error("Failed to load university info.");
        }
      };

      fetchUniversityName();
    } else if (status === "unauthenticated") {
      setUniversityName("Not authorized");
    }
  }, [status, session, setValue]);

  useEffect(() => {
    reset((prev) => ({
      ...prev,
      department: "",
      batch_year: "",
      major: "",
      skills: [], // Reset to an empty array
      facebook: "",
      linkedIn: "",
    }));
  }, [selectedRole, reset]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      console.log("onSubmit function triggered!");
      console.log("Form Data Submitted:", formData);

      // Convert skills array to a comma-separated string if it's not empty
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
        ...(skillsString && { skills: skillsString }), // Use the converted string
        ...(formData.facebook && { facebook: formData.facebook }),
        ...(formData.linkedIn && { linkedIn: formData.linkedIn }),
        status: "approved",
      };

      let apiPath;
      if (formData.role === "teacher") {
        apiPath = "/api/university/teacher";
      } else if (formData.role === "student") {
        apiPath = "/api/university/student";
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
          university_id: session?.user?.university_id || "",
          department: "",
          batch_year: "",
          major: "",
          skills: [], // Reset to an empty array
          facebook: "",
          linkedIn: "",
        });
      } else {
        toast.error(
          response.data.message || "Something went wrong during creation."
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      console.log("Submitting skills:", formData.skills); // This will still log the array before conversion

      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("Server response error:", err.response.data);
          console.error("Status:", err.response.status);
          console.error("Headers:", err.response.headers);

          if (err.response.data && err.response.data.message) {
            toast.error(err.response.data.message);
          } else if (err.response.data && err.response.data.errors) {
            err.response.data.errors.forEach((errorMsg) =>
              toast.error(errorMsg)
            );
          } else {
            toast.error(`Server Error: ${err.response.status}`);
          }
        } else if (err.request) {
          console.error("No response received:", err.request);
          toast.error("No response from server. Network issue?");
        } else {
          console.error("Axios request setup error:", err.message);
          toast.error(`Request Error: ${err.message}`);
        }
      } else {
        toast.error(err.message || "An unexpected error occurred.");
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
      university_id: session?.user?.university_id || "",
      department: "",
      batch_year: "",
      major: "",
      skills: [], // Reset to an empty array
      facebook: "",
      linkedIn: "",
    });
    toast("Form has been reset.");
  };

  if (status === "loading") {
    return <Typography>Loading session...</Typography>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "university") {
    return (
      <Typography color="error" variant="h6" sx={{ p: 3 }}>
        You are not authorized to access this page. Please log in as a
        university user.
      </Typography>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffff", p: 3 }}>
      <Typography variant="h5" mb={2}>
        Create Teacher/Student Account
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" sx={{ p: 2 }} onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Name"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Email"
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>

          <Box display="flex" mb={2}>
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.role}>
            <InputLabel id="role-label">Role</InputLabel>
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

          <TextField
            label="University Name"
            fullWidth
            sx={{ mb: 2 }}
            value={universityName}
            InputProps={{
              readOnly: true,
            }}
            error={!!errors.university_id}
            helperText={errors.university_id?.message}
          />

          {selectedRole === "teacher" && (
            <TextField
              select
              label="Department"
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
                  label="Batch Year"
                  fullWidth
                  type="number"
                  {...register("batch_year")}
                  error={!!errors.batch_year}
                  helperText={errors.batch_year?.message}
                />
                <FormControl fullWidth error={!!errors.major}>
                  <InputLabel id="major-label">Major</InputLabel>
                  <Controller
                    name="major"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="major-label"
                        label="Major"
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
              <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.skills}>
                <Controller
                  name="skills"
                  control={control}
                  defaultValue={[]} // Ensure default value is an empty array
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={skillOptions}
                      value={value || []} // Ensure value is an array for Autocomplete
                      onChange={(_, data) => onChange(data)}
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
                          label="Skills"
                          placeholder="Type and press enter..."
                          error={!!errors.skills}
                          helperText={errors.skills?.message}
                        />
                      )}
                    />
                  )}
                />
              </FormControl>

              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label="Facebook URL"
                  fullWidth
                  {...register("facebook")}
                  error={!!errors.facebook}
                  helperText={errors.facebook?.message}
                />
                <TextField
                  label="LinkedIn URL"
                  fullWidth
                  {...register("linkedIn")}
                  error={!!errors.linkedIn}
                  helperText={errors.linkedIn?.message}
                />
              </Box>
            </>
          )}

          <Stack direction="row" spacing={2} mt={3}>
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              sx={{ px: 4 }}
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
            <Button
              variant="outlined"
              type="button"
              color="error"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}