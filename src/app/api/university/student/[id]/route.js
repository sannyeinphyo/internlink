import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  // Get session
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "university") {
    return NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  // Get user id from session (university user)
  const universityUserId =
    typeof session.user.id === "string"
      ? parseInt(session.user.id, 10)
      : session.user.id;

  if (!universityUserId) {
    return NextResponse.json(
      { message: "University user ID not found in session." },
      { status: 403 }
    );
  }

  try {
    // Find the university record for this user
    const university = await prisma.university.findUnique({
      where: { user_id: universityUserId },
    });

    if (!university) {
      return NextResponse.json(
        { message: "University not found for this user." },
        { status: 403 }
      );
    }

    // Extract university id to filter students by
    const universityIdFromSession = university.id;

    // Get student id param from route params
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    const studentUserId = parseInt(id, 10);
    if (isNaN(studentUserId)) {
      return NextResponse.json(
        { message: "Invalid Student ID" },
        { status: 400 }
      );
    }

    // Query the student user with the university constraint
    const studentUser = await prisma.user.findFirst({
      where: {
        id: studentUserId,
        role: "student",
        student: {
          university_id: universityIdFromSession,
        },
      },
      include: {
        student: {
          include: {
            university: true,
          },
        },
      },
    });

    if (!studentUser) {
      return NextResponse.json(
        {
          message:
            "Student not found or you are not authorized to view this student.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Student details fetched successfully",
        data: studentUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching university student details:", error);
    return NextResponse.json(
      {
        message: "Error fetching student details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
