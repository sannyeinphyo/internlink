"use client";
import React from "react";
import AdminSideBar from "@/components/admin_components/AdminSideBar";
export default function AdminLayout({ children }) {
  return <AdminSideBar>{children}</AdminSideBar>;
}
