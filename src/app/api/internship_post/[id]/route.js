import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid job post ID" },
        { status: 400 }
      );
    }

    // Get student profile linked to user
    const student = await prisma.student.findUnique({
      where: { user_id: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const job = await prisma.internshipPost.findUnique({
      where: { id },
      include: {
        company: true,
        applications: {
          where: { student_id: student.id },
          select: { id: true, status: true },
        },
      },
    });

    return NextResponse.json({
      message: "Getting internship detail...",
      data: job,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error getting internship detail",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
