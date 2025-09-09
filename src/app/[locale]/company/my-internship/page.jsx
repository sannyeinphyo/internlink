"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

function EditPostDialog({ open, onClose, post, onUpdated }) {
  const [formData, setFormData] = useState({
    title: post.title || "",
    job_type: post.job_type || "",
    salary: post.salary || 0,
    description: post.description || "",
    application_deadline: post.application_deadline
      ? post.application_deadline.slice(0, 10)
      : "",
  });

  React.useEffect(() => {
    setFormData({
      title: post.title || "",
      job_type: post.job_type || "",
      salary: post.salary || 0,
      description: post.description || "",
      application_deadline: post.application_deadline
        ? post.application_deadline.slice(0, 10)
        : "",
    });
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.patch(`/api/company/posts/${post.id}`, formData);
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Update failed");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Internship Post</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Title"
          name="title"
          fullWidth
          value={formData.title}
          onChange={handleChange}
        />
        {/* <TextField
          margin="dense"
          label="Job Type"
          name="job_type"
          fullWidth
          value={formData.job_type}
          onChange={handleChange}
        /> */}
         <TextField
          margin="dense"
          label="Description"
          name="description"
          fullWidth
          value={formData.description}
          onChange={handleChange}
        />
        {/* <TextField
          margin="dense"
          label="Salary"
          name="salary"
          type="number"
          fullWidth
          value={formData.salary}
          onChange={handleChange}
        /> */}
        <TextField
          margin="dense"
          label="Application Deadline"
          name="application_deadline"
          type="date"
          fullWidth
          value={formData.application_deadline}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MyInternship() {
  const t = useTranslations("myintern-ship");
  const theme = useTheme();
  const [mypost, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { locale } = useParams();
  const router = useRouter();

  const fetchOwnInternshipPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/company/posts`);
      setPosts(res.data || []);
    } catch (err) {
      setError("Failed to fetch internship posts.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOwnInternshipPosts();
  }, []);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await axios.delete(`/api/company/posts/${postToDelete.id}`);
      fetchOwnInternshipPosts();
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (err) {
      alert("Failed to delete post.");
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom fontWeight={"bold"}>
        {t("myinternship")}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : mypost.length === 0 ? (
        <Typography>{t("no_post")}</Typography>
      ) : (
        <Grid container spacing={3}>
          {mypost.map((post, index) => (
            <Card
              variant="outlined"
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: theme.shadows[6],
                },
                width: "100%",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  component={"span"}
                  variant="h6"
                  fontWeight="bold"
                  pr={2}
                  gutterBottom
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={post.title}
                >
                  {post.title}
                </Typography>

                <Stack
                  display={"inline"}
                  fontWeight="700"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Chip
                    label={`${t("applied")}: ${post._count?.applications || 0}`}
                    color="primary"
                    size="small"
                    variant="contained"
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={1}
                  sx={{
                    height: 48,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={post.description || ""}
                >
                  {post.description || "-"}
                </Typography>

                <Stack spacing={1} mb={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WorkIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {t("job_type")}: {post.job_type || "-"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {t("location")}: {post.location || "-"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MonetizationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {t("salary")}:{" "}
                      {post.paid
                        ? `${post.salary?.toLocaleString()}MMK`
                        : "Unpaid"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {t("application_deadline")}:{" "}
                      {post.application_deadline
                        ? new Date(
                            post.application_deadline
                          ).toLocaleDateString()
                        : "-"}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  <Chip
                    label={post.paid ? t("paid") : t("unpaid")}
                    color={post.paid ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={post.remote ? t("remote") : t("onsite")}
                    color={post.remote ? "info" : "default"}
                    size="small"
                  />
                  {post.positions && (
                    <Chip
                      label={`${post.positions} ${t("positions")}${
                        post.positions > 1 ? t("s") : ""
                      }`}
                      color="primary"
                      size="small"
                    />
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() =>
                    router.push(
                      `/${locale}/company/jobs_details/${post.id}?backUrl=/${locale}/company/my-internship`
                    )
                  }
                >
                  {t("view")}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEditPost(post)}
                >
                  {t("edit")}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(post)}
                >
                  {t("delete")}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Grid>
      )}

      {editPost && (
        <EditPostDialog
          open={Boolean(editPost)}
          post={editPost}
          onClose={() => setEditPost(null)}
          onUpdated={fetchOwnInternshipPosts}
        />
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t("confirm_delete_text", { title: postToDelete?.title })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t("cancel")}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
