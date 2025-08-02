import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Myanmar",
  src: "/fonts/NotoSansMyanmar-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 12,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    fontFamily: "Myanmar",
  },
  logo: {
    width: 60,
    height: 60,
  },
  date: {
    fontSize: 10,
    color: "#666",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#003cff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subInfo: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  // --- Simplified table styles using pure flexbox ---
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerCell: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    color: "#333",
    fontWeight: "bold",
    textAlign: "left",
  },
  cell: {
    padding: 8,
    fontSize: 11,
    textAlign: "left",
    fontFamily: "Myanmar",
  },
  colNo: { flex: 0.5 },
  colStudent: { flex: 2 },
  colBatch: { flex: 1 },
  colCompany: { flex: 2 },
  colStatus: { flex: 1 },
});

function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InternshipReportPdf({
  reportData = [],
  university = "University",
  batch = "All Batches",
  logo = "http://localhost:3000/uni/ucsh.jpg",
}) {
  const dataToRender = Array.isArray(reportData) ? reportData : [];
  const now = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Image src={logo} style={styles.logo} />
        </View>

        <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
          <Text style={styles.date}>Generated: {formatDateTime(now)}</Text>
        </View>

        <Text style={styles.title}>Student Internship Report</Text>
        <Text style={styles.subInfo}>
          University: {university} | Batch of Report: {batch}
        </Text>

        <View style={styles.table}>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "#f5f5f5" }]}>
            <Text style={[styles.headerCell, styles.colNo]}>No</Text>
            <Text style={[styles.headerCell, styles.colStudent]}>Student</Text>
            <Text style={[styles.headerCell, styles.colBatch]}>Batch</Text>
            <Text style={[styles.headerCell, styles.colCompany]}>Company</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
          </View>

          {dataToRender.map((row, i) => (
            <View
              style={styles.row}
              key={i}
            >
              <Text style={[styles.cell, styles.colNo]}>{i + 1}</Text>
              <Text style={[styles.cell, styles.colStudent]}>{row.studentName || "-"}</Text>
              <Text style={[styles.cell, styles.colBatch]}>
                {row.batchYear || "-"}
              </Text>
              <Text style={[styles.cell, styles.colCompany]}>{row.companyName || "—"}</Text>
              <Text
                style={[
                  styles.cell,
                  styles.colStatus,
                  {
                    color:
                      row.status === "applied"
                        ? "#1976d2"
                        : row.status === "accepted"
                        ? "#2e7d32"
                        : "#d32f2f",
                    fontWeight: "bold",
                  }
                ]}
              >
                {row.status || "-"}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
