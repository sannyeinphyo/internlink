"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from "@mui/icons-material";

import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import "react-toastify/dist/ReactToastify.css";

export default function UniversityList() {
  const t = useTranslations("teacher_list");
  const { locale } = useParams();
  const { data: session, status: sessionStatus } = useSession();

  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherPerPage = 5;

  const getTeacherList = useCallback(async () => {
    if (
      sessionStatus === "unauthenticated" ||
      session?.user?.role !== "university" ||
      !session?.user?.id
    ) {
      setError(t("not_authorized"));
      toast.error(t("not_authorized"));
      setTeachers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get("/api/university/teacher");
      setTeachers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || t("fetch_failed");
      toast.error(msg);
      setError(msg);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [session, sessionStatus, t]);

  useEffect(() => {
    if (sessionStatus !== "loading") getTeacherList();
  }, [sessionStatus, getTeacherList]);

  const handleDeleteTeacher = (teacherId) => {
    toast.warn(
      ({ closeToast }) => (
        <Box>
          <Typography>{t("confirm_delete")}</Typography>
          <Typography>{t("irreversible")}</Typography>
          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <Button onClick={closeToast} variant="outlined" color="inherit">
              {t("cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                closeToast();
                try {
                  const response = await axios.delete(
                    `/api/university/teacher/${teacherId}/delete`
                  );
                  toast.success(response.data.message || t("delete_success"));
                  getTeacherList();
                } catch (error) {
                  toast.error(t("delete_failed"));
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
        draggable: false,
        pauseOnHover: false,
        className: "custom-confirm-toast",
      }
    );
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      teacher.name?.toLowerCase().includes(q) ||
      teacher.email?.toLowerCase().includes(q) ||
      teacher.teacher?.department?.toLowerCase().includes(q) ||
      teacher.teacher?.university?.name?.toLowerCase().includes(q);

    const matchesStatus =
      filterStatus === "" ||
      teacher.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const indexOfLast = currentPage * teacherPerPage;
  const indexOfFirst = indexOfLast - teacherPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTeachers.length / teacherPerPage);
  const uniqueStatuses = [...new Set(teachers.map((t) => t.status).filter(Boolean))];

  if (sessionStatus === "loading" || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography ml={2}>{t("loading")}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (
    sessionStatus === "unauthenticated" ||
    session?.user?.role !== "university" ||
    !session?.user?.id
  ) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        {t("not_authorized")}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <ToastContainer />
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2} gap={2}>
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
            <InputLabel>{t("status")}</InputLabel>
            <Select
              value={filterStatus}
              label={t("status")}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <MenuItem value="">{t("all")}</MenuItem>
              {uniqueStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f4fc" }}>
            <TableRow>
              <TableCell>{t("No")}</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("email")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell>{t("department")}</TableCell>
              <TableCell align="center">{t("action")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTeachers.length > 0 ? (
              currentTeachers.map((teacher, index) => (
                <TableRow
                  key={teacher.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f6f9ff",
                    "&:hover": { backgroundColor: "#eef3ff" },
                  }}
                >
                  <TableCell>{indexOfFirst + index + 1}</TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        teacher.status === "pending"
                          ? "orange"
                          : teacher.status === "approved"
                          ? "green"
                          : teacher.status === "declined"
                          ? "red"
                          : "inherit",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {teacher.status}
                  </TableCell>
                  <TableCell>{teacher.teacher?.department}</TableCell>
                  <TableCell align="center">
                    <Link href={`/${locale}/university/teacher/${teacher.id}`} passHref>
                      <IconButton>
                        <VisibilityIcon sx={{ color: "blue" }} />
                      </IconButton>
                    </Link>
                    <IconButton onClick={() => handleDeleteTeacher(teacher.id)}>
                      <DeleteIcon sx={{ color: "red" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t("no_teachers")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
        <Button
          variant="outlined"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <KeyboardArrowLeftIcon />
        </Button>
        <Box display="flex" alignItems="center">
          {t("page")} {currentPage} of {totalPages}
        </Box>
        <Button
          variant="outlined"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <KeyboardArrowRightIcon />
        </Button>
      </Stack>
    </Box>
  );
}
