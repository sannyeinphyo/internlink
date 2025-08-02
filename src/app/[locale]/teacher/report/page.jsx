"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Button,
  Stack,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import TeacherReportDownload from "@/components/TeacherReportDownload";

const statuses = ["", "applied", "accepted", "rejected"];

export default function TeacherReportGenerator() {
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [reportData, setReportData] = useState(null);
  const [generatedUniversity, setGeneratedUniversity] = useState("");
  const [generatedBatch, setGeneratedBatch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchRes = await axios.get("/api/teacher/batches");
        setBatches(batchRes.data);

        const profileRes = await axios.get("/api/teacher/profile");
        setUniversityName(profileRes.data.universityName || "");
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setReportData(null); 

    try {
      const filters = {
        batch_year: batch || undefined, 
        status: status || undefined,
      };

      const res = await axios.post("/api/teacher/report", filters);

      setReportData(Array.isArray(res.data.data) ? res.data.data : []);
      setGeneratedUniversity(res.data.university || universityName);
      setGeneratedBatch(res.data.batch || batch);
    } catch (error) {
      console.error("Generation error:", error.response?.data || error.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={6}
      sx={{
        maxWidth: 520,
        mx: "auto",
        mt: 8,
        borderRadius: 2,
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        p: 4,
      }}
      className="ring-1 ring-gray-200"
    >
      <CardContent>
        <Typography
          variant="h4"
          className="text-center mb-2 font-semibold text-gray-900 tracking-wide"
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Internship Report Generator
        </Typography>

        <Typography
          variant="body2"
          mb={4}
          className="text-center text-gray-600 max-w-[420px] mx-auto"
          sx={{ lineHeight: 1.6 }}
        >
          Generate detailed PDF reports for internship applications for{" "}
          <strong>{universityName || "your university"}</strong> based on
          filters like batch year and application status.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography
          variant="subtitle1"
          mb={4}
          className="font-medium text-gray-800 tracking-wide"
          sx={{ letterSpacing: "0.02em" }}
        >
          Select Filters
        </Typography>

        <Stack spacing={4}>
          <TextField
            select
            label="Batch Year"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            fullWidth
            size="medium"
            helperText="Choose a batch year or all batches"
            sx={{
              "& .MuiInputLabel-root": { fontWeight: 600, mb: 1 },
              "& .MuiSelect-select": { paddingY: 1.5, fontSize: 15 },
              "& .MuiFormHelperText-root": { mt: 1.5 },
            }}
          >
            <MenuItem value="">All Batches</MenuItem>
            {batches.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Application Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            size="medium"
            helperText="Filter applications by status"
            sx={{
              "& .MuiInputLabel-root": { fontWeight: 600, mb: 1 },
              "& .MuiSelect-select": { paddingY: 1.5, fontSize: 15 },
              "& .MuiFormHelperText-root": { mt: 1.5 },
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s || "All"}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            fullWidth
            size="large" // Use large size to fill the width
            className="bg-blue-600 hover:bg-blue-700 text-white"
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1.1rem",
              py: 1.8,
              boxShadow: "0 5px 16px rgba(59, 130, 246, 0.4)",
              mt: 2, // Adjust spacing from the last TextField
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Report"
            )}
          </Button>

          {/* Conditional rendering for download button and feedback message */}
          {!loading && reportData && (
            <Stack alignItems="center" spacing={2} sx={{ mt: 2 }}>
              {reportData.length > 0 ? (
                // A secondary button for download to distinguish it from the main action
                <TeacherReportDownload
                  reportData={reportData}
                  university={generatedUniversity}
                  batch={generatedBatch ? `Batch ${generatedBatch}` : "All Batches"}
                  logo={"http://localhost:3000/uni/ucsh.jpg"}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  No internship records found for the selected filters.
                </Typography>
              )}
            </Stack>
          )}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          className="block mt-8 text-center"
          sx={{ fontStyle: "italic" }}
        >
          * Filters apply only to your university&apos;s applications.
        </Typography>
      </CardContent>
    </Card>
  );
}