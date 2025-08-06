"use client";

import { Box, Typography, Chip, Stack } from "@mui/material";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
 import { useTranslations } from "next-intl";

export default function SavedPostPage() {
  const [savedPosts, setSavedPosts] = useState([]);
  const { data: session } = useSession();
  const { locale } = useParams();
  const t = useTranslations("bookmarks");

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const toastId = "loading-savedposts";
      toast.loading("Loading saved posts...", { id: toastId });
      try {
        const res = await axios.get("/api/savepost");
        setSavedPosts(res.data?.data || []);
        toast.success("Saved posts loaded", { id: toastId });
      } catch (error) {
        toast.error("Failed to load saved posts", { id: toastId });
      }
    };

    fetchSavedPosts();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} mt={3} fontWeight={"bold"}>
        {t("save_post")}
      </Typography>
      <Typography mb={3} mt={3} fontSize={"16px"} fontWeight={"500"}>
        {t("title")}{" "}
      </Typography>

      {savedPosts.length === 0 ? (
        <Typography
          width={"100%"}
          height={"100%"}
          alignItems={"certer"}
          justifyContent={"center"}
        >
          No saved posts found.
        </Typography>
      ) : (
        savedPosts.map((saved) => {
          const post = saved.internshipPost;
          return (
            <motion.div
              key={saved.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                key={saved.id}
                href={`/${locale}/jobs/${post.id}?backUrl=/${locale}/student/bookmarks`}
                style={{ textDecoration: "none" }}
              >
                <Box
                  p={3}
                  mb={3}
                  border="1px solid #ddd"
                  borderRadius={2}
                  boxShadow={1}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                    },
                    color: "inherit",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    {post.title}{" "}
                    <Chip label={t("saved")} size="small" color="secondary" />
                  </Typography>

                  <Typography variant="body2" mb={1}>
                    {post.description}
                  </Typography>

                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip
                      label={post.job_type}
                      color="primary"
                      variant="contained"
                    />
                    <Chip
                      label={post.remote ? t("Remote") : t("Onsite")}
                      color={post.remote ? "warning" : "info"}
                      variant="contained"
                    />
                    <Chip
                      label={post.paid ? t("paid") : t("unpaid")}
                      color={post.paid ? "success" : "error"}
                      variant="contained"
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {t("Location")}: {post.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("Salary")}: {post.salary?.toLocaleString()} MMK
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("Deadline")}:{" "}
                    {new Date(post.application_deadline).toLocaleDateString()}
                  </Typography>
                </Box>
              </Link>
            </motion.div>
          );
        })
      )}
    </Box>
  );
}
