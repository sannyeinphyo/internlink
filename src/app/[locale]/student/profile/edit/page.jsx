"use client";

import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { PhotoCamera } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

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

const defaultProfile = {
  name: "",
  major: "",
  batchYear: "",
  skills: [],
  facebook: "",
  linkedin: "",
  Github: "",
  image: "",
  student_id_image: "",
};

export default function StudentProfileEdit() {
  const [form, setForm] = useState(defaultProfile);
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`/api/student/profile`);
        const student = res.data || {};
        setForm({
          name: student.user?.name || "",
          major: student.major || "",
          batchYear: student.batch_year || "",
          skills: student.skills
            ? student.skills.split(",").map((s) => s.trim())
            : [],
          facebook: student.facebook || "",
          linkedin: student.linkedIn || "",
          Github: student.Github || "",
          image: student.user?.image || "",
          student_id_image: student.student_id_image || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (event, newValue) => {
    setForm({ ...form, skills: newValue });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills.join(", "),
      };
      const response = await axios.put(`/api/student/profile`, payload);
      if (response.status === 200) {
        router.push(`/${locale}/student/profile`);
      } else {
        console.error("Update failed", response);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prevForm) => ({
        ...prevForm,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleStudentId = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prevForm) => ({
        ...prevForm,
        student_id_image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="md" className="py-10">
        <Paper elevation={6} className="p-6 rounded-2xl">
          <Typography variant="h5" fontWeight="bold" mb={4}>
            Edit Profile
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box marginY={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Profile Image
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  {form.image && (
                    <Avatar
                      src={form.image}
                      alt="Profile"
                      sx={{ width: 64, height: 64 }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                  >
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {form.image && (
                    <Button
                      color="error"
                      onClick={() => setForm({ ...form, image: "" })}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={form.name}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                name="major"
                label="Major"
                value={form.major}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                name="batchYear"
                label="Batch Year"
                value={form.batchYear}
                onChange={handleChange}
                margin="normal"
              />
              <Autocomplete
                multiple
                freeSolo
                options={skillOptions}
                value={Array.isArray(form.skills) ? form.skills : []}
                onChange={handleSkillsChange}
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
                    label="Skill"
                    size="small"
                    placeholder="Type and press enter..."
                    fullWidth
                  />
                )}
              />
              <TextField
                fullWidth
                name="facebook"
                label="Facebook URL"
                value={form.facebook}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                name="linkedin"
                label="LinkedIn URL"
                value={form.linkedin}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                name="Github"
                label="GitHub URL"
                value={form.Github}
                onChange={handleChange}
                margin="normal"
              />
              <Grid item xs={12} md={6}>
                <Box marginY={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Upload Student ID Image
                  </Typography>
                  <Box width={"100%"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
                    <Card
                      sx={{
                        maxWidth: 320,
                        width:"320px",
                        textAlign: "center",
                        p: 2,
                        borderRadius: "12px",
                        boxShadow: 3,
                      }}
                    >
                      <CardContent>
                        {form.student_id_image ? (
                          <Avatar
                            src={form.student_id_image}
                            alt="Profile"
                            variant="rounded"
                            sx={{
                              width: "100%",
                              height: "auto",
                              borderRadius: "8px",
                              mb: 2,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: 180,
                              border: "2px dashed #ccc",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <Typography color="text.secondary">
                              No ID image uploaded
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" justifyContent="center" gap={1}>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<PhotoCamera />}
                          >
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleStudentId}
                            />
                          </Button>
                          {form.student_id_image && (
                            <Button
                              color="error"
                              variant="outlined"
                              onClick={() =>
                                setForm({ ...form, student_id_image: "" })
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Grid>

              <Box mt={4} display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => router.back()}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </motion.div>
  );
}
