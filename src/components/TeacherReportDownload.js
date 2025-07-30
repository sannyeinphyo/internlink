"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InternshipReportPdf from "./InternshipReportPdf";
import { Button } from "@mui/material";

export default function TeacherReportDownload({ reportData, university, batch, logo }) {
  return (
    <PDFDownloadLink
      document={
        <InternshipReportPdf
          reportData={reportData}
          university={university}
          batch={batch}
          logo={logo}
        />
      }
      fileName="internship_report.pdf"
    >
      {({ loading }) =>
        loading ? (
          <Button variant="outlined" disabled>
            Generating...
          </Button>
        ) : (
          <Button variant="contained" color="primary">
            Download Report
          </Button>
        )
      }
    </PDFDownloadLink>
  );
}
