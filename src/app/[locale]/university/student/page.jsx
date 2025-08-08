"use client";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  IconButton,
  Typography,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState, useCallback, use } from "react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function UniversityStudentList() {
  const t = useTranslations("student_list");
  const { locale } = useParams();
  const { data: session, status: sessionStatus } = useSession();

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const studentsPerPage = 5;

  const getStudentList = useCallback(async () => {
    if (sessionStatus === "loading") return;

    if (
      sessionStatus === "unauthenticated" ||
      session?.user?.role !== "university" ||
      !session?.user?.id
    ) {
      setError(t("fetch_failed"));
      setLoading(false);
      toast.error(t("not_authorized"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/university/student");
      console.log(
        "University Student List API Response Data:",
        response.data.data
      );
      if (Array.isArray(response.data.data)) {
        setStudents(response.data.data);
      } else {
        console.warn(
          "API response.data.data is not an array for university students:",
          response.data.data
        );
        setStudents([]);
      }
    } catch (err) {
      console.error("API Error fetching university students:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load students. Please try again."
      );
      toast.error(err.response?.data?.message || "Failed to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  const handleDeleteStudent = async (studentId) => {
    toast.warn(
      ({ closeToast }) => (
        <Box>
          <Typography variant="body1">
            {t("confirm_delete")}
            <br />
            {t("irreversible")}
          </Typography>

          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                closeToast();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                closeToast();
                try {
                  const response = await axios.delete(
                    `/api/university/student/${studentId}/delete`
                  );
                  toast.success(
                    response.data.message || "Student deleted successfully!"
                  );
                  getStudentList();
                } catch (error) {
                  console.error("Error deleting student:", error);
                  toast.error(
                    "Failed to delete student. " +
                      (error.response?.data?.message || error.message)
                  );
                }
              }}
            >
             {t("delete")}
            </Button>
          </Stack>
        </Box>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        pauseOnHover: false,
        className: "custom-confirm-toast",
      }
    );
  };

  useEffect(() => {
    getStudentList();
  }, [getStudentList]);

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const query = searchQuery.toLowerCase();
        const studentName = student.name?.toLowerCase() || "";
        const studentEmail = student.email?.toLowerCase() || "";
        const studentMajor = student.student?.major?.toLowerCase() || "";
        const studentStatus = student.status?.toLowerCase() || "";
        const studentUniversityName =
          student.student?.university?.name?.toLowerCase() || "";
        const studentBatchYear = String(
          student.student?.batch_year || ""
        ).toLowerCase();
        const studentSkills = student.student?.skills?.toLowerCase() || "";

        const matchesSearch =
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          studentUniversityName.includes(query) ||
          studentBatchYear.includes(query) ||
          studentSkills.includes(query) ||
          studentMajor.includes(query) ||
          studentStatus.includes(query);

        const matchesStatus =
          filterStatus === "" || studentStatus === filterStatus.toLowerCase();

        const matchesMajor =
          filterMajor === "" || studentMajor === filterMajor.toLowerCase();

        return matchesSearch && matchesStatus && matchesMajor;
      })
    : [];

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const uniqueMajors = [
    ...new Set(
      students.map((student) => student.student?.major).filter(Boolean)
    ),
  ].sort();
  const uniqueStatuses = [
    ...new Set(students.map((student) => student.status).filter(Boolean)),
  ].sort();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
        <Typography ml={2}>Loading students...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <ToastContainer />
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        mb={2}
        gap={2}
      >
        <Typography variant="h5">{t("title")}</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            variant="outlined"
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { minWidth: 250 },
            }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={filterStatus}
              label={t("status")}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="major-filter-label">Major</InputLabel>
            <Select
              labelId="major-filter-label"
              id="major-filter"
              value={filterMajor}
              label={t("major")}
              onChange={(e) => {
                setFilterMajor(e.target.value);
                setCurrentPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueMajors.map((major) => (
                <MenuItem key={major} value={major}>
                  {major}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("No")}.</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("email")}</TableCell>
              <TableCell>{t("account_status")}</TableCell>
              <TableCell>{t("batch_year")}</TableCell>
              <TableCell>{t("major")}</TableCell>
              <TableCell align="center">{t("action")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <TableRow
                  key={student.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f6f9ff",
                    "&:hover": {
                      backgroundColor: "#eef3ff",
                    },
                  }}
                >
                  <TableCell>{indexOfFirstStudent + index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        student.status === "pending"
                          ? "orange"
                          : student.status === "approved"
                          ? "green"
                          : student.status === "declined"
                          ? "red"
                          : "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {student.status.charAt(0).toUpperCase() +
                      student.status.slice(1)}
                  </TableCell>
                  <TableCell>{student.student?.batch_year}</TableCell>
                  <TableCell>{student.student?.major}</TableCell>
                  <TableCell align="center">
                    <Link
                      href={`/${locale}/university/student/${student.id}`}
                      passHref
                    >
                      <IconButton>
                        <VisibilityIcon sx={{ color: "blue" }} />
                      </IconButton>
                    </Link>
                    <IconButton onClick={() => handleDeleteStudent(student.id)}>
                      <DeleteIcon sx={{ color: "red" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No students found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} justifyContent="end" mt={2}>
        <Button
          variant="outlined"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <KeyboardArrowLeftIcon />
        </Button>
        <Box display="flex" alignItems="center">
          Page {currentPage} of {totalPages}
        </Box>
        <Button
          variant="outlined"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <KeyboardArrowRightIcon />
        </Button>
      </Stack>
    </Box>
  );
}
