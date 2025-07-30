// src/app/api/admin/teacher/[id]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET request to fetch a single teacher user by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "Your Not Authorized" },
      { status: 403 }
    ); // 403 Forbidden
  }

  try {
    const { id } = params; // Extract the teacher ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { message: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Convert id to an integer, as Prisma IDs are typically integers
    const teacherId = parseInt(id, 10);
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { message: "Invalid Teacher ID" },
        { status: 400 }
      );
    }

    // Find the user with the given ID and 'teacher' role, including their teacher details and university
    const teacherUser = await prisma.user.findUnique({
      where: {
        id: teacherId,
        role: "teacher",
      },
      include: {
        teacher: {
          // Include the associated teacher profile
          include: {
            university: true, // Further include the university details
          },
        },
      },
    });

    if (!teacherUser) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Teacher details fetched successfully",
      data: teacherUser, // Return the full teacher user object with nested teacher and university data
    });
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    return NextResponse.json(
      {
        message: "Error fetching teacher details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
