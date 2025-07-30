import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        student: {
          university_id: teacher.university_id,
        },
      },
      include: {
        student: {
          include: {
            user: true,
            university: true,
          },
        },
        post: {
          include: {
            company: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: applications });
  } catch (error) {
    console.error("Applications error:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications", error: error.message },
      { status: 500 }
    );
  }
}
