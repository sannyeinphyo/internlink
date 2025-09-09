"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  IconButton,
  Typography,
  CardActions,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useSession } from "next-auth/react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaidIcon from "@mui/icons-material/Paid";
import WorkIcon from "@mui/icons-material/Work";
import { ButtonPrimary, ButtonOutline } from "./Button";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function JobCard({
  id,
  logo,
  title,
  timestamp,
  subheader,
  description,
  location,
  paid,
  job_type,
  skills = [],
  onApply,
  disabled = false,
}) {
  const router = useRouter();
  const { locale } = useParams();

  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSaved = savedPosts?.some((post) => post.internship_post_id === id);
  const { data: session } = useSession();
  const t = useTranslations("jobs");

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!session) return;
      try {
        const res = await axios.get("/api/savepost", { withCredentials: true });
        setSavedPosts(res.data.data || []);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [session]);

  const handleBookmarkToggle = async () => {
    try {
      if (isSaved) {
        await axios.delete(`/api/savepost/${id}`, { withCredentials: true });
        toast("Removed from bookmarks", { icon: "❌" });
        setSavedPosts((prev) =>
          prev.filter((post) => post.internship_post_id !== id)
        );
      } else {
        await axios.post(
          "/api/savepost",
          { internship_post_id: id },
          { withCredentials: true }
        );
        toast.success("Bookmarked!");
        setSavedPosts((prev) => [...prev, { internship_post_id: id }]);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleViewDetails = () => {
    if (!locale || !id) {
      console.error("Missing locale or id!");
      return;
    }
    router.push(`/${locale}/jobs/${id}`);
  };

  const tagColors = [
    { bg: "rgba(25, 118, 210, 0.2)", text: "#1976d2" },
    { bg: "rgba(233, 30, 99, 0.2)", text: "#e91e63" },
    { bg: "rgba(76, 175, 80, 0.2)", text: "#4caf50" },
    { bg: "rgba(255, 152, 0, 0.2)", text: "#ff9800" },
  ];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.7 }}
      >
        <Card
          sx={{
            width: "400px",
            height: "350px",
            borderRadius: 2,
            textAlign: "left",
            boxShadow: 3,
          }}
        >
          <Box height={"80px"}>
            <CardHeader
              avatar={logo}
              action={
                <IconButton
                  onClick={handleBookmarkToggle}
                  aria-label="bookmark"
                >
                  <BookmarkIcon style={{ color: isSaved ? "red" : "gray" }} />
                </IconButton>
              }
              title={subheader}
              subheader={`${title} • ${timestamp}`}
            />
          </Box>
          <Box height={"180px"}>
            <CardContent mb={2}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
                className="truncate w-[300px]"
              >
                {description}
              </Typography>
              <Stack spacing={1} mt={2}>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">{location}</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={"8px"}>
                  <PaidIcon fontSize="small" color="action" />
                  <Typography
                    sx={{
                      color: paid ? "success.main" : "error.main",
                      fontWeight: 500,
                    }}
                    variant="body2"
                  >
                    {paid ? "Paid" : "Unpaid"}
                  </Typography>
                </Box>

                {job_type && (
                  <Box display="flex" alignItems="center" gap={1} mb={"8px"}>
                    <WorkIcon fontSize="small" color="action" />
                    <Typography variant="body2">{job_type}</Typography>
                  </Box>
                )}
              </Stack>
              {skills.slice(0, 3).map((skill, index) => {
                const color = tagColors[index % tagColors.length];
                return (
                  <Chip
                    // className="truncate w-[100px]"
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      marginTop: "8px",
                      backgroundColor: color.bg,
                      color: color.text,
                      fontWeight: 500,
                      border: "none",
                      borderRadius: 1,
                      margin: "4px 2px 0 2px",
                      "&:hover": {
                        backgroundColor: color.bg,
                        opacity: 0.8,
                      },
                    }}
                  />
                );
              })}
            </CardContent>
          </Box>
          <CardActions sx={{ justifyContent: "space-evenly", gap: 1, mb: 2 }}>
            <ButtonPrimary size="small" onClick={onApply} disabled={disabled}>
              {t("apply_now")}
            </ButtonPrimary>
            <ButtonOutline
              variant="contained"
              size="small"
              onClick={handleViewDetails}
            >
              {t("view_details")}
            </ButtonOutline>
          </CardActions>
        </Card>
      </motion.div>
    </Box>
  );
}
