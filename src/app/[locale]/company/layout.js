"use client";
import { Box } from "@mui/material";
import Sidebar from "./SideBar";
import Navbar from "./Navbar";

export default function CompanyLayout({ children }) {
  return (
   
    <Box sx={{ display: "flex" }}>
       <Navbar/>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p:`100px 20px` }}>{children}</Box>
    </Box>
  );
}
