"use client";

import {
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { GitHub, LinkedIn } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
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

const skillColors = [
  "#FFB6C1",
  "#87CEFA",
  "#90EE90",
  "#FFD700",
  "#FFA07A",
  "#9370DB",
  "#40E0D0",
  "#FF69B4",
];

function randomColor(skill) {
  let hash = 0;
  for (let i = 0; i < skill.length; i++) {
    hash = skill.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % skillColors.length;
  return skillColors[index];
}

const defaultProfile = {
  name: "",
  email: "",
  major: "",
  batchYear: "",
  skills: [],
  linkedin: "",
  github: "",
  image: "",
  university: "",
};

export default function StudentProfileView() {
  const [profile, setProfile] = useState(defaultProfile);
  const router = useRouter();
  const { locale, id } = useParams();

  useEffect(() => {
    if (!id) {
      return;
    }
    async function fetchProfile() {
      try {
        const res = await axios.get(`/api/student/profile/${id}`);
        const student = res.data || {};

        const studentProfile = {
          name: student.user?.name || "",
          email: student.user?.email || "",
          major: student.major || "",
          batchYear: student.batch_year || "",
          skills: student.skills
            ? student.skills.split(",").map((s) => s.trim())
            : [],
          linkedin: student.linkedIn || "",
          github: student.Github || "",
          image: student.user?.image || "",
          university: student.university?.name || "",
        };

        setProfile(studentProfile);
      } catch (e) {
        console.error(e);
      }
    }

    fetchProfile();
  }, [id]);

  return (
    <Container maxWidth="md" className="py-10">
      <Paper
        elevation={10}
        className="rounded-3xl overflow-hidden shadow-xl"
        sx={{
          backdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.85)",
        }}
      >
        <Box className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 h-44">
          <Avatar
            src={profile.image}
            alt={profile.name}
            sx={{
              width: 120,
              height: 120,
              border: "5px solid white",
              boxShadow: 3,
              position: "absolute",
              bottom: -60,
              left: "50%",
              transform: "translateX(-50%)",
              "&:": {
                transform: "scale(1.15)",
              },
            }}
          />
        </Box>

        <Box className="pt-16 pb-10 px-8">
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile.name || "Unnamed"}
            </Typography>
            <Typography color="text.secondary" fontSize="1.1rem">
              {profile.university}
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />

          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Personal Information
            </Typography>
            <Typography>
              <strong>Email:</strong> {profile.email}
            </Typography>
          </Box>

          {/* Academic Info */}
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Academic Information
            </Typography>
            <Typography>
              <strong>Major:</strong> {profile.major}
            </Typography>
            <Typography>
              <strong>Batch Year:</strong> {profile.batchYear}
            </Typography>
          </Box>

          {/* Skills */}
          {profile.skills.length > 0 && (
            <Box mb={4}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Skills
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {profile.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    sx={{
                      bgcolor: randomColor(skill),
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {(profile.linkedin || profile.github) && (
            <Box mb={2}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Social Profiles
              </Typography>
              <Box display="flex" gap={2}>
                {profile.linkedin && (
                  <Tooltip title="LinkedIn">
                    <IconButton
                      component={MuiLink}
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: "#0077B5",
                        color: "white",
                        "&:hover": { bgcolor: "#005582" },
                      }}
                    >
                      <LinkedIn />
                    </IconButton>
                  </Tooltip>
                )}
                {profile.github && (
                  <Tooltip title="GitHub">
                    <IconButton
                      component={MuiLink}
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: "#333",
                        color: "white",
                        "&:hover": { bgcolor: "#000" },
                      }}
                    >
                      <GitHub />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          )}
          <Button variant="outlined" onClick={() => router.push(`/${locale}/company/dashboard`)}>
            ← Back to Company
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
