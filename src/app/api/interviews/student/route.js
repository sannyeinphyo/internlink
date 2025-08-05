// /app/api/interviews/student/route.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const interviews = await prisma.interview.findMany({
      where: {
        student: {
          user_id: session.user.id,
        },
      },
      include: {
        post: {
          include: {
            company: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Failed to fetch student interviews:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
