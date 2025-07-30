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
    try {
      const filters = {};
      if (batch) filters.batch_year = batch;
      if (status) filters.status = status;

      const res = await axios.post("/api/teacher/report", filters);
      setReportData(res.data); // Save report data to state
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
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

        <Divider mb={4} />

        <Typography
          variant="subtitle1"
          className="mb-4 font-medium text-gray-800 tracking-wide"
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
            size="large"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            sx={{
              borderRadius: 2,
              fontWeight: "700",
              textTransform: "none",
              fontSize: "1.1rem",
              py: 1.8,
              boxShadow: "0 5px 14px rgb(59 130 246 / 0.45)",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Report"
            )}
          </Button>

          {reportData && (
            <TeacherReportDownload
              reportData={reportData}
              university={universityName}
              batch={batch ? `Batch ${batch}` : "All Batches"}
              logo={"http://localhost:3000/uni/ucsh.jpg"}
            />
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
