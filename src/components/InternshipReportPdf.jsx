import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
const logo = "http://localhost:3000/uni/ucsh.jpg";

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
  table: {
    display: "table",
    width: "100%",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    color: "#333",
    borderRightWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    fontWeight: "bold",
    textAlign: "left",
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 11,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "#eee",
    textAlign: "left",
    fontFamily: "Myanmar",
  },
  evenRow: {
    backgroundColor: "#fafafa",
  },
  lastCell: {
    borderRightWidth: 0,
  },
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
  reportData,
  university = "Example University",
  batch = "Batch 2025",
  logo = "http://localhost:3000/uni/ucsh.jpg",
}) {
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
          <View style={styles.row}>
            <Text style={styles.headerCell}>No</Text>
            <Text style={styles.headerCell}>Student</Text>
            <Text style={styles.headerCell}>Company</Text>
            <Text style={styles.headerCell}>Status</Text>
          </View>

          {reportData.map((row, i) => (
            <View
              style={[
                styles.row,
                i % 2 === 0 ? styles.evenRow : null, 
              ]}
              key={i}
            >
              <Text style={[styles.cell]}>{i + 1}</Text>
              <Text style={styles.cell}>{row.studentName}</Text>
              <Text style={styles.cell}>{row.companyName || "—"}</Text>
              <Text
                style={{
                  ...styles.cell,
                  color:
                    row.status === "applied"
                      ? "#1976d2"
                      : row.status === "accepted"
                      ? "#2e7d32"
                      : "#d32f2f",
                  fontWeight: "bold",
                }}
              >
                {row.status}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
