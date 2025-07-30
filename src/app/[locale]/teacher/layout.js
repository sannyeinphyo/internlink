"use client";
import React from "react";
import TeacherSideBar from "@/components/teacher/TeacherSideBar";
export default function TeacherLayout({ children }) {
  
  return <TeacherSideBar>{children}</TeacherSideBar>;
}
