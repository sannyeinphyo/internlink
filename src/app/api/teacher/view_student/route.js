import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: user.id },
      select: { university_id: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const students = await prisma.student.findMany({
      where: { university_id: teacher.university_id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Teacher students API error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
