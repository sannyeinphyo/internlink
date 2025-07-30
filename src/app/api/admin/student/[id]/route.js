// src/app/api/admin/student/[id]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET request to fetch a single student user by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "Your Not Authorized" },
      { status: 403 }
    ); // 403 Forbidden
  }

  try {
    const { id } = params; // Extract the student ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Convert id to an integer, as Prisma IDs are typically integers
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { message: "Invalid Student ID" },
        { status: 400 }
      );
    }

    // Find the user with the given ID and 'student' role, including their student details and university
    const studentUser = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: "student",
      },
      include: {
        student: {
          // Include the associated student profile
          include: {
            university: true, // Further include the university details
          },
        },
      },
    });

    if (!studentUser) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Student details fetched successfully",
      data: studentUser, // Return the full student user object with nested student and university data
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      {
        message: "Error fetching student details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
