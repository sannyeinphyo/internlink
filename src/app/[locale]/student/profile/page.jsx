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
  Collapse,
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
import  { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tesseract from "tesseract.js";
import StudentIdFromBase64 from "@/components/StudentIdFromBase64";
import { useTranslations } from "next-intl";

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
  const [openStudentId, setOpenStudentId] = useState(false);
  const [showStudentId, setShowStudentId] = useState(true);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const t = useTranslations("student-profile");




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
          studentId: student.student_id_image || "",
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

  const doOCR = async (imageUrl) => {
    setOcrLoading(true);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(imageUrl, "eng");
      setOcrText(text);
    } catch (error) {
      console.error("OCR failed:", error);
      setOcrText("Failed to extract text from the image.");
    } finally {
      setOcrLoading(false);
    }
  };

  console.log("Student ID base64:", profile.studentId);

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
              cursor:"pointer",
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
                  style={{ maxWidth: "100px", borderRadius: "8px" , cursor:"pointer" }}
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
             <Lightbox
              open={openStudentId}
              close={() => setOpenStudentId(false)}
              slides={[{ src: profile.studentId }]}
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
              {t("edit_profile")}
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
              {t("personal_info")}
            </Typography>

            <Typography gutterBottom>
              <strong>{t("email")}:</strong> {profile.email}{" "}
              <span style={{ marginLeft: "4px" }}>{isVerified}</span>
            </Typography>

            {profile.studentId && (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    mt: 1,
                    cursor: "pointer",
                    "&:hover": { color: "primary.main" },
                  }}
                  onClick={() => setShowStudentId((prev) => !prev)}
                >
                  <Typography fontWeight="bold">{t("student_id")}</Typography>
                  <IconButton size="small">
                    <ExpandMoreIcon
                      sx={{
                        transform: showStudentId
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                </Box>

                <Collapse in={showStudentId}>
                  <Paper
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: "#f5f5f5",
                      fontWeight: "bold",
                    }}
                  >
                    <Box
                     onClick = {() => setOpenStudentId(true) }
                      display={"flex"}
                      width={"100%"}
                      justifyContent={"center"}
                      sx={{cursor:"pointer"}}
                    >
                      <img

                        src={profile.studentId}
                        width={"30%"}
                        height={"50%"}
                      />
                    </Box>
                  </Paper>
                </Collapse>
              </>
            )}
            {/* {profile.studentId && (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ cursor: "pointer", mt: 2 }}
                  onClick={() => setShowOcr((prev) => !prev)}
                >
                  <Typography fontWeight="bold" flexGrow={1}>
                    Student ID Info
                  </Typography>
                  <IconButton size="small">
                    <ExpandMoreIcon
                      sx={{
                        transform: showOcr ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                </Box>

                <Collapse in={showOcr}>
                  <Paper
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: "#f9f9f9",
                      whiteSpace: "pre-wrap",
                      maxHeight: 160,
                      overflowY: "auto",
                    }}
                  >
                    {ocrLoading ? (
                      <Typography>Extracting ID info...</Typography>
                    ) : (
                      <Typography>{ocrText || "No data extracted."}</Typography>
                    )}
                  </Paper>
                </Collapse>
              </>
            )} */}

            <StudentIdFromBase64 base64Image={profile.studentId} />
          </Box>

          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              {t("academic_info")}
            </Typography>
            <Typography>
              <strong>{t("major")}:</strong> {profile.major}
            </Typography>
            <Typography>
              <strong>{t("batch_year")}:</strong> {profile.batchYear}
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
                {t("skills")}
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
                {t("social")}
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
