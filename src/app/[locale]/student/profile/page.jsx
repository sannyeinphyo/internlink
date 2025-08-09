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
import { GitHub, LinkedIn, Facebook } from "@mui/icons-material";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import VerifiedIcon from "@mui/icons-material/Verified";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import Link from "next/link";
import lightbox, { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

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
  facebook: "",
  linkedin: "",
  Github: "",
  image: "",
  university: "",
  verified: "",
  uniimage: "",
};

export default function StudentProfileView() {
  const [profile, setProfile] = useState(defaultProfile);
  const router = useRouter();
  const { locale } = useParams();
  const [openUni, setOpenUni] = useState(false);
  const [openStudent, setOpenStudent] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`/api/student/profile`);
        const student = res.data || {};

        const studentProfile = {
          name: student.user?.name || "",
          email: student.user?.email || "",
          major: student.major || "",
          batchYear: student.batch_year || "",
          skills: student.skills
            ? student.skills.split(",").map((s) => s.trim())
            : [],
          facebook: student.facebook || "",
          linkedin: student.linkedIn || "",
          Github: student.Github || "",
          image: student.user?.image || "",
          university: student.university?.name || "",
          uniimage: student.university.user.image || "",
          verified: student.user.verified,
        };

        setProfile(studentProfile);
      } catch (e) {
        console.error(e);
      }
    }

    fetchProfile();
  }, []);
  console.log(profile);

  const verifiedRaw = profile.verified;
  const isVerifiedBool = Boolean(verifiedRaw === true || verifiedRaw === 1);
  const isVerified = isVerifiedBool ? (
    <>
      <Tooltip title={"Your email is verified"}>
        <VerifiedIcon
          sx={{ width: 16, height: 16, color: "green", m: "0 8px" }}
        />
        <Typography component={"span"}>verified</Typography>
      </Tooltip>
    </>
  ) : (
    <>
      <Link href={`/${locale}/verify-email?email=${profile.email}`}>
        <Tooltip title={"Your email is not verified"}>
          <NewReleasesIcon
            sx={{ width: 16, height: 16, color: "red", m: "0 8px" }}
          />
          <Typography component={"span"}>unverified</Typography>
        </Tooltip>
      </Link>
    </>
  );
  console.log("Getting profile", profile);
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
            onClick={() => setOpenStudent(true)}
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

            <Box justifyContent={"center"} display={"flex"} mb={2}>
              {profile.uniimage ? (
                <img
                  src={profile.uniimage}
                  alt="University Image"
                  style={{ maxWidth: "100px", borderRadius: "8px" }}
                  onClick={() => setOpenUni(true)}
                />
              ) : (
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: "grey.300",
                    borderRadius: 2,
                  }}
                />
              )}
            </Box>
            <Lightbox
              open={openUni}
              close={() => setOpenUni(false)}
              slides={[{ src: profile.uniimage }]}
              render={{
                slide: ({ slide }) => (
                  <img
                    src={slide.src}
                    alt="University Image"
                    style={{
                      width: "50%",
                      height: "auto",
                      userSelect: "none",
                    }}
                  />
                ),
              }}
            />
            <Lightbox
              open={openStudent}
              close={() => setOpenStudent(false)}
              slides={[{ src: profile.image }]}
              render={{
                slide: ({ slide }) => (
                  <img
                    src={slide.src}
                    alt="Student Profile"
                    style={{
                      width: "50%",
                      height: "auto",
                      userSelect: "none",
                    }}
                  />
                ),
              }}
            />

            <Typography color="text.secondary" fontSize="1.1rem" gutterBottom>
              {profile.university}
            </Typography>
          </Box>
          <Box mt={4} display="flex" justifyContent="center">
            <Button
              startIcon={<Edit size={18} />}
              onClick={() => router.push(`/${locale}/student/profile/edit`)}
            >
              Edit Profile
            </Button>
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
              <strong>Email:</strong> {profile.email}{" "}
              <span style={{ marginLeft: "4px" }}>{isVerified}</span>
            </Typography>
          </Box>

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

          {(profile.facebook || profile.linkedin || profile.Github) && (
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
                {profile.facebook && (
                  <Tooltip title="Facebook">
                    <IconButton
                      component={MuiLink}
                      href={profile.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: "#0077B5",
                        color: "white",
                        "&:hover": { bgcolor: "#005582" },
                      }}
                    >
                      <Facebook />
                    </IconButton>
                  </Tooltip>
                )}

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
                {profile.Github && (
                  <Tooltip title="GitHub">
                    <IconButton
                      component={MuiLink}
                      href={profile.Github}
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
        </Box>
      </Paper>
    </Container>
  );
}
