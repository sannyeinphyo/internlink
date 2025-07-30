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
      include: {
        university: {
          select: { name: true },

        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        student: {
          university_id: teacher.university_id,
        },
      },
    });
    const department = teacher.department || "Unknown Department";
    const universityName = teacher.university?.name || "Unknown University";

    const total = applications.length;
    const applied = applications.filter(
      (app) => app.status === "applied"
    ).length;
    const accepted = applications.filter(
      (app) => app.status === "accepted"
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "rejected"
    ).length;

    const recentApplicationsRaw = await prisma.internshipApplication.findMany({
      where: {
        student: {
          university_id: teacher.university_id,
        },
      },
      include: {
        student: {
          select: { user: { select: { name: true } }, batch_year: true },
        },
        post: {
          include: {
            company: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        applied_at: "desc",
      },
      take: 10,
    });

    const recentApplications = recentApplicationsRaw.map((app) => ({
      studentName: app.student.user.name,
      companyName: app.post?.company?.user?.name || "-",
      status: app.status,
      batch_year: app.student.batch_year,
    }));
    const allApps = await prisma.internshipApplication.findMany({
      where: {
        student: {
          university_id: teacher.university_id,
        },
      },
      select: {
        status: true,
        student: {
          select: { batch_year: true },
        },
      },
    });

    const batchYearStats = {};

    allApps.forEach(({ status, student }) => {
      const year = student.batch_year || "Unknown";
      if (!batchYearStats[year])
        batchYearStats[year] = { applied: 0, accepted: 0, rejected: 0 };
      batchYearStats[year][status] = (batchYearStats[year][status] || 0) + 1;
    });

    return NextResponse.json({
      total,
      applied,
      accepted,
      rejected,
      recentApplications,
      batchYearStats,
      universityName,
      department
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return NextResponse.json(
      { message: "Failed to load dashboard data", error: error.message },
      { status: 500 }
    );
  }
}
