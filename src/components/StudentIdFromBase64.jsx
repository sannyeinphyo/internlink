import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Collapse,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tesseract from "tesseract.js";
import EXIF from "exif-js";
import { useTranslations } from "next-intl";

export default function StudentIdFromBase64({ base64Image }) {
  const [ocrText, setOcrText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const t = useTranslations("student-profile")

  useEffect(() => {
    if (!base64Image) return;
    preprocessAndRunOcr(base64Image);
  }, [base64Image]);

  const rotateBasedOnExif = (img) => {
    return new Promise((resolve) => {
      EXIF.getData(img, function () {
        const orientation = EXIF.getTag(this, "Orientation") || 1;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const { width, height } = img;

        // Set canvas dimensions based on orientation
        if ([5, 6, 7, 8].includes(orientation)) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        // Apply transform based on EXIF orientation
        switch (orientation) {
          case 2:
            // horizontal flip
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            // 180° rotate
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            // vertical flip
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            // vertical flip + 90 rotate right
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            // 90° rotate right
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
          case 7:
            // horizontal flip + 90 rotate right
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            // 90° rotate left
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
          default:
            // no transform
            break;
        }

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      });
    });
  };

  const preprocessImage = async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = base64.startsWith("data:image")
        ? base64
        : `data:image/jpeg;base64,${base64}`;

      img.onload = async () => {
        try {
          const correctedBase64 = await rotateBasedOnExif(img);
          const correctedImg = new Image();
          correctedImg.src = correctedBase64;

          correctedImg.onload = () => {
            const maxWidth = 800;
            const maxHeight = 800;
            let width = correctedImg.width;
            let height = correctedImg.height;

            if (width > maxWidth || height > maxHeight) {
              const scale = Math.min(maxWidth / width, maxHeight / height);
              width = width * scale;
              height = height * scale;
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(correctedImg, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Grayscale
            for (let i = 0; i < data.length; i += 4) {
              const gray =
                0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              data[i] = data[i + 1] = data[i + 2] = gray;
            }

            // Brightness boost
            const brightnessBoost = 15;
            for (let i = 0; i < data.length; i += 4) {
              let val = data[i] + brightnessBoost;
              val = Math.min(255, Math.max(0, val));
              data[i] = data[i + 1] = data[i + 2] = val;
            }

            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL("image/png"));
          };
          correctedImg.onerror = () => {
            console.warn("Corrected image failed to load, returning original");
            resolve(base64);
          };
        } catch (err) {
          console.warn("Error during EXIF rotation, returning original", err);
          resolve(base64);
        }
      };

      img.onerror = () => {
        console.error("Image failed to load for preprocessing.");
        resolve(base64);
      };
    });
  };

  const preprocessAndRunOcr = async (base64) => {
    try {
      setOcrLoading(true);
      setOcrError(null);
      console.log("Starting preprocessing and OCR...");

      const cleanedImage = await preprocessImage(base64);

      const {
        data: { text },
      } = await Tesseract.recognize(cleanedImage, "eng", {
        logger: (m) => console.log("Tesseract:", m),
      });

      console.log("OCR text extracted:", text);
      setOcrText(text);
      setParsedData(parseStudentIdText(text));
      setShowOcr(true);
      setShowRawText(false);
    } catch (err) {
      console.error("OCR error:", err);
      setOcrError("Failed to extract student ID info.");
      setOcrText("");
      setParsedData(null);
      setShowOcr(true);
    } finally {
      setOcrLoading(false);
    }
  };

  const normalizeUniversity = (uni) => {
    const map = {
      minthada: "Hinthada",
      hinthada: "Hinthada",
      hinthda: "Hinthada",
      "minthads fi": "Hinthada",
      "minthada ~~": "Hinthada",
    };
    let lower = uni.toLowerCase();
    for (const k in map) {
      if (lower.includes(k)) return "University of Computer Studies, " + map[k];
    }
    return uni;
  };

  const parseStudentIdText = (text) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let parsed = {
      university: "Not Found",
      academicYear: "Not Found",
      name: "Not Found",
      rollNo: "Not Found",
      issueDate: "Not Found",
    };

    const rollNoRegex = /\b(5?CS|5C5|5C3|5CT)[-\s]?(\d{2,6})\b/i;
    const dateRegex = /(\d{2}[./-]\d{2}[./-]\d{4})/;
    const yearRangeRegex = /(\d{4}[/-]\d{4})/;

    for (const line of lines) {
      if (/roll/i.test(line)) {
        const match = line.match(rollNoRegex);
        if (match) {
          let prefix = match[1].toUpperCase();
          const number = match[2];
          if (prefix === "5C3" || prefix === "5C5") prefix = "5CS";
          parsed.rollNo = `${prefix}-${number}`;
          break;
        }
      }
    }
    if (parsed.rollNo === "Not Found") {
      for (const line of lines) {
        const match = line.match(rollNoRegex);
        if (match) {
          let prefix = match[1].toUpperCase();
          const number = match[2];
          if (prefix === "5C3" || prefix === "5C5") prefix = "5CS";
          parsed.rollNo = `${prefix}-${number}`;
          break;
        }
      }
    }

    for (const line of lines) {
      const yearRangeMatch = line.match(yearRangeRegex);
      if (yearRangeMatch) {
        parsed.academicYear = yearRangeMatch[1];
        break;
      }
    }

    for (const line of lines) {
      if (line.toLowerCase().includes("name")) {
        const nameMatch = line.match(/name\s*[:-\s]?\s*(.+)/i);
        if (nameMatch) {
          parsed.name = nameMatch[1].trim();
          break;
        }
      }
    }

    if (parsed.name === "Not Found") {
      for (const line of lines) {
        const hasDigits = /\d/.test(line);
        const words = line.split(" ");
        const hasEnoughWords = words.length >= 2 && words.length <= 4;
        const keywords = [
          "university",
          "roll",
          "year",
          "issue",
          "date",
          "name",
        ];
        const containsKeywords = keywords.some((kw) =>
          line.toLowerCase().includes(kw)
        );

        if (!hasDigits && hasEnoughWords && !containsKeywords) {
          parsed.name = line.trim();
          break;
        }
      }
    }

    for (const line of lines) {
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        parsed.issueDate = dateMatch[1];
        break;
      }
    }

    const uniLine = lines.find((line) => {
      const lower = line.toLowerCase();
      return (
        lower.includes("computer studies") &&
        (lower.includes("hinthada") ||
          lower.includes("minthada") ||
          lower.includes("hinthda"))
      );
    });
    if (uniLine) {
      const match = uniLine.match(/(.*hinthada)/i);
      parsed.university = match
        ? normalizeUniversity(match[1].trim())
        : uniLine.trim();
    }

    if (parsed.academicYear) {
      const years = parsed.academicYear.split("-");
      if (years.length === 2) {
        const y1 = parseInt(years[0], 10);
        let y2 = parseInt(years[1], 10);

        if (y2 < y1 || y2 > y1 + 1) {
          y2 = y1 + 1;
          parsed.academicYear = `${y1}-${y2}`;
        }
      }
    }

    // Fix common name typos and capitalize
    const nameCorrections = {
      nysin: "Nyein",
      phye: "Phyo",
      kyew: "Kyaw",
      kyow: "Kyaw",
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const fixName = (name) => {
      return name
        .split(" ")
        .map((word) => {
          const lower = word.toLowerCase();
          return nameCorrections[lower]
            ? nameCorrections[lower]
            : capitalize(lower);
        })
        .join(" ");
    };

    if (parsed.name && parsed.name !== "Not Found") {
      parsed.name = fixName(parsed.name);
    }

    return parsed;
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        sx={{ cursor: "pointer", mt: 2 }}
        onClick={() => setShowOcr((prev) => !prev)}
      >
        <Typography fontWeight="bold" flexGrow={1}>
          {t("student_id")}
        </Typography>
        <IconButton size="small" aria-label="toggle student id info">
          <ExpandMoreIcon
            sx={{
              transform: showOcr ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </IconButton>
      </Box>

      <Collapse in={showOcr}>
        <Paper sx={{ mt: 1, p: 2, bgcolor: "#f9f9f9", whiteSpace: "pre-wrap" }}>
          {ocrLoading ? (
            <Typography>Extracting ID info...</Typography>
          ) : ocrError ? (
            <Typography color="error">{ocrError}</Typography>
          ) : parsedData ? (
            <>
              <Typography>
                <strong>{t("university")}:</strong> {parsedData.university || "-"}
              </Typography>
              <Typography>
                <strong>{t("academic_info")}:</strong> {parsedData.academicYear || "-"}
              </Typography>
              <Typography>
                <strong>{t("name")}:</strong> {parsedData.name || "-"}
              </Typography>
              <Typography>
                <strong>{t("roll")}:</strong> {parsedData.rollNo || "-"}
              </Typography>
              <Typography>
                <strong>{t("issue_date")}:</strong> {parsedData.issueDate || "-"}
              </Typography>

              <Box mt={2} display="flex" alignItems={"center"} gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => preprocessAndRunOcr(base64Image)}
                  disabled={ocrLoading}
                  aria-label="Retry OCR"
                >
                  {t("retry")}
                </Button>
                {/* <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowRawText((prev) => !prev)}
                  sx={{ mt: 1 }}
                >
                  {showRawText ? "Hide Raw OCR Text" : "Show Raw OCR Text"}
                </Button> */}
              </Box>

              <Collapse in={showRawText}>
                <Paper
                  id="raw-ocr-text"
                  variant="outlined"
                  sx={{
                    mt: 1,
                    p: 1,
                    maxHeight: 200,
                    overflow: "auto",
                    bgcolor: "#fff",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: 13,
                  }}
                >
                  {ocrText || "-"}
                </Paper>
              </Collapse>
            </>
          ) : (
            <Typography>No data extracted.</Typography>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}
