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
import { useTranslations } from "next-intl";

const statuses = ["", "applied", "accepted", "rejected"];

export default function TeacherReportGenerator() {
  const t = useTranslations("TeacherReport");
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
        const batchRes = await axios.get("/api/university/batches");
        setBatches(batchRes.data);

        const profileRes = await axios.get("/api/university/profile");
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

      const res = await axios.post("/api/university/report", filters);

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
          variant="h5"
        
          className="text-center font-semibold text-gray-900 tracking-wide"
          sx={{ fontFamily: "'Poppins', sans-serif", marginBottom:4}}
        >
          {t("title")}
        </Typography>

        <Typography
          variant="body2"
          mb={4}
          className="text-center text-gray-600 max-w-[420px] mx-auto"
          sx={{ lineHeight: 1.6 }}
        >
          {t("description", { university: universityName || t("yourUniversity") })}
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography
          variant="subtitle1"
          mb={4}
          className="font-medium text-gray-800 tracking-wide"
          sx={{ letterSpacing: "0.02em" }}
        >
          {t("filters")}
        </Typography>

        <Stack spacing={4}>
          <TextField
            select
            label={t("batchLabel")}
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            fullWidth
            size="medium"
            helperText={t("batchHelper")}
            sx={{
              "& .MuiInputLabel-root": { fontWeight: 600, mb: 1 },
              "& .MuiSelect-select": { paddingY: 1.5, fontSize: 15 },
              "& .MuiFormHelperText-root": { mt: 1.5 },
            }}
          >
            <MenuItem value="">{t("allBatches")}</MenuItem>
            {batches.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label={t("statusLabel")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            size="medium"
            helperText={t("statusHelper")}
            sx={{
              "& .MuiInputLabel-root": { fontWeight: 600, mb: 1 },
              "& .MuiSelect-select": { paddingY: 1.5, fontSize: 15 },
              "& .MuiFormHelperText-root": { mt: 1.5 },
            }}
          >
            <MenuItem value="">{t("allStatuses")}</MenuItem>
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s || t("all")}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            fullWidth
            size="large"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1.1rem",
              py: 1.8,
              boxShadow: "0 5px 16px rgba(59, 130, 246, 0.4)",
              mt: 2,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t("generate")}
          </Button>

          {!loading && reportData && (
            <Stack alignItems="center" spacing={2} sx={{ mt: 2 }}>
              {reportData.length > 0 ? (
                <TeacherReportDownload
                  reportData={reportData}
                  university={generatedUniversity}
                  batch={generatedBatch ? `${t("batchPrefix")} ${generatedBatch}` : t("allBatches")}
                  logo={"http://localhost:3000/uni/ucsh.jpg"}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                  {t("noRecords")}
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
          {t("note")}
        </Typography>
      </CardContent>
    </Card>
  );
}