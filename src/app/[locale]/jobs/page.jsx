"use client";
import React, { useState, useEffect } from "react";
import JobCards from "@/components/JobCards";
import { formatDistanceToNow } from "date-fns";
import ColorfulLoader from "@/components/ColorfulLoader";
import { Box, TextField, Typography, Button, Avatar } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslations } from "next-intl";
import axios from "axios";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { showConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "react-hot-toast";
import { red } from "@mui/material/colors";
import Link from "next/link";

export default function Jobs() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [open, setOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(null);
  const jobst = useTranslations("Jobs");
  const { locale } = useParams();

  const fetchInternship = async () => {
    try {
      const res = await axios.get("/api/internship_post");
      setInternships(res.data.data || []);
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInternship();
  }, []);

  const handleApply = async (postId, companyUserId) => {
    const confirmed = await showConfirmDialog({
      title: jobst("title"),
      text: jobst("text"),
      confirmButtonText: jobst("confirm"),
      cancelButtonText: jobst("cancel"),
    });

    if (!confirmed) return toast.error(jobst("cancel"));

    try {
      setApplyLoading(postId);

      await axios.post("/api/internshipapplication", {
        post_id: postId,
      });

      await fetch("/api/notifications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: companyUserId,
          title: "New Application",
          body: "A student applied to your internship post.",
        }),
      });
      await fetchInternship();
      toast.success(jobst("success"));
    } catch (error) {
      toast.error(jobst("error"));
    } finally {
      setApplyLoading(null);
    }
  };

  const filteredJobs = internships
    .filter((job) => {
      const searchLower = searchText.toLowerCase();
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.company?.name?.toLowerCase().includes(searchLower) ||
        job.requirements?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const groupedJobs = {
    applied: [],
    rejected: [],
    available: [],
  };
  
  filteredJobs.forEach((job) => {
    const status = job.applications?.[0]?.status;

    if (status === "applied") {
      groupedJobs.applied.push(job);
    } else if (status === "rejected") {
      groupedJobs.rejected.push(job);
    } else {
      groupedJobs.available.push(job);
    }
  });

  const renderJobGroup = (jobs, label) => {
    if (jobs.length === 0) return null;
    let bgColor;
    if (label === jobst("label1")) bgColor = "#eefff4ff";
    else if (label === jobst("label2")) bgColor = "#ebf8ffff";
    else if (label === jobst("label3")) bgColor = "#ffeeeeff";
    return (
      <Box
        sx={{
          width: "100%",
          mt: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: bgColor,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          {label}
        </Typography>
        <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "24px",
              justifyContent: "flex-start",
            }}
          >
            {jobs.map((job) => {
              const status = job.applications?.[0]?.status;
              const isDisabled =
                status === "applied" ||
                status === "rejected" ||
                status === "accepted";

              return (
                <JobCards
                  key={job.id}
                  id={job.id}
                  logo={
                    <Link
                      href={`/${locale}/student/view_company/${job.company.id}`}
                      passHref
                    >
                      <Avatar
                        src={job.company?.image}
                        sx={{ bgcolor: red[400] }}
                      >
                        {!job.company?.image && job.company.name?.[0]}
                      </Avatar>
                    </Link>
                  }
                  title={job.title}
                  timestamp={`Posted ${formatDistanceToNow(
                    new Date(job.createdAt),
                    { addSuffix: true }
                  )}`}
                  subheader={job.company.name || ""}
                  description={job.description}
                  location={job.location}
                  paid={job.paid}
                  skills={
                    Array.isArray(job.requirements)
                      ? job.requirements
                      : job.requirements?.split(",")
                  }
                  onApply={() => handleApply(job.id, job.company.user_id)}
                  disabled={isDisabled}
                  applyLoading={applyLoading === job.id}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          padding: "2rem",
          minHeight: "100vh",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "center",
        }}
      >
        <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
          <Box
            onMouseOver={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            sx={{
              position: "fixed",
              top: 100,
              left: 0,
              height: open ? 180 : 100,
              width: open ? 200 : 20,
              backgroundColor: "rgb(245, 253, 254)",
              padding: "1rem",
              overflow: "hidden",
              transition: "all 0.3s ease",
              zIndex: 1200,
              alignItems: "center",
              borderRadius: "4px",
              boxShadow: open ? 3 : 0,
              animation: open ? "none" : "blinkShadow 1.5s infinite alternate",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {open ? "Search & Sort" : <FilterListIcon />}
            </Typography>

            {open && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  size="small"
                  label="Search Jobs"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                >
                  Sort by Date: {sortOrder === "asc" ? "Oldest" : "Newest"}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ width: "100%", textAlign: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            {jobst("BrowseJobs")}
          </Typography>
          <Typography sx={{ fontSize: "1.2rem", color: "#666" }}>
            {jobst("Description")}
          </Typography>
        </Box>

        {loading ? (
          <ColorfulLoader fullScreen={false} size={40} thickness={5} rainbow />
        ) : filteredJobs.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
              mt: 5,
            }}
          >
            <Box
              component="img"
              src="/error/error.png"
              alt="No Results"
              sx={{ width: "80px", mb: 2 }}
            />
            <Typography sx={{ fontSize: "1.2rem", color: "#666" }}>
              No Internship Found
            </Typography>
          </Box>
        ) : (
          <>
            {renderJobGroup(groupedJobs.available, jobst("label1"))}
            {renderJobGroup(groupedJobs.applied, jobst("label2"))}
            {renderJobGroup(groupedJobs.rejected, jobst("label3"))}
          </>
        )}
      </Box>
    </Box>
  );
}
