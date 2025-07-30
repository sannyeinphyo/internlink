// app/api/admin/internshipapplication/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const applications = await prisma.internshipApplication.findMany({
      include: {
        post: {
          select: {
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        applied_at: "desc", 
      },
    });

    const formattedApplications = applications.map((app) => ({
      id: app.id,
      post_name: app.post.title,
      company_name: app.post.company.name, 
      student_name: app.student.user.name,
      status: app.status,
      applied_at: app.applied_at.toISOString().split("T")[0], 
    }));

    return NextResponse.json({
      message: "Getting all internship applications...",
      data: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching internship applications:", error);
    return NextResponse.json(
      {
        message: "Error fetching internship applications",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
