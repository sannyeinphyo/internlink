// src/app/api/university/teacher/[id]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const awaitedParams = await params;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "university" || !session.user.id) {
    return NextResponse.json(
      { message: "Forbidden: You do not have the necessary permissions" },
      { status: 403 }
    );
  }

  const teacherUserIdString = awaitedParams.id;

  if (!teacherUserIdString) {
    return NextResponse.json(
      { message: "Teacher User ID is required" },
      { status: 400 }
    );
  }

  const teacherUserId = parseInt(teacherUserIdString, 10);

  if (isNaN(teacherUserId)) {
    return NextResponse.json(
      { message: "Invalid Teacher User ID format" },
      { status: 400 }
    );
  }

  try {
    const teacherUser = await prisma.user.findUnique({
      where: {
        id: teacherUserId,
        role: "teacher",
      },
      include: {
        teacher: {
          include: {
            university: true,
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

    const sessionUniversityId =
      typeof session.user.id === "string"
        ? parseInt(session.user.id, 10)
        : session.user.id;

    if (!sessionUniversityId) {
      return NextResponse.json(
        {
          message:
            "Forbidden: You can only view teachers associated with your university.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: teacherUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    if (error.name === "PrismaClientValidationError") {
      return NextResponse.json(
        { message: "Invalid request parameters or data structure." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "Failed to fetch teacher details due to a server error.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
