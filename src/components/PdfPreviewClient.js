
"use client";

import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import InternshipReportPdf from "./InternshipReportPdf";

export default function PdfPreviewClient({ reportData }) {
  return (
    <div style={{ height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <InternshipReportPdf
          reportData={reportData}
          university="University of Computer Studies Hinthada"
          batch_year="2024"
        />
      </PDFViewer>
    </div>
  );
}
