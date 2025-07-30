import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "university") {
    return NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  const universityIdFromSession = session.user.id;
  if (!universityIdFromSession) {
    console.warn(
      "API: University session found, but university_id is missing."
    );
    return NextResponse.json(
      { message: "University ID not found in session." },
      { status: 403 }
    );
  }

  try {
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

    const studentUser = await prisma.user.findUnique({
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
