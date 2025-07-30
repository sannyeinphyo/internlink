import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "You are not authenticated." },
      { status: 401 }
    );
  }

  if (session.user.role !== "university") {
    return NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  const universityId = session.user.university_id;

  if (!session.user.id) {
    return NextResponse.json(
      { message: "University ID not found in session. Please log in again." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year"));
  const startDate = year ? new Date(`${year}-01-01T00:00:00Z`) : undefined;
  const endDate = year ? new Date(`${year + 1}-01-01T00:00:00Z`) : undefined;

  try {
    // Count teachers and students (optionally filtered by year of their user.createdAt)
    const [totalTeachers, totalStudents] = await Promise.all([
      prisma.teacher.count({
        where: {
          university_id: universityId,
          ...(year && {
            user: {
              createdAt: { gte: startDate, lt: endDate },
            },
          }),
        },
      }),
      prisma.student.count({
        where: {
          university_id: universityId,
          ...(year && {
            user: {
              createdAt: { gte: startDate, lt: endDate },
            },
          }),
        },
      }),
    ]);

    // Count internship applications filtered by year using applied_at
    const totalApplicationsSubmitted = await prisma.internshipApplication.count(
      {
        where: {
          student: { university_id: universityId },
          ...(year && {
            applied_at: { gte: startDate, lt: endDate },
          }),
        },
      }
    );

    // Group internship applications by status filtered by year
    const statusCounts = await prisma.internshipApplication.groupBy({
      by: ["status"],
      _count: { status: true },
      where: {
        student: { university_id: universityId },
        ...(year && {
          applied_at: { gte: startDate, lt: endDate },
        }),
      },
    });

    const statusMap = {
      applied: 0,
      accepted: 0,
      rejected: 0,
    };
    statusCounts.forEach((item) => {
      const key = item.status.toLowerCase();
      if (statusMap[key] !== undefined) {
        statusMap[key] = item._count.status;
      }
    });

    const applicationStatusData = [
      { name: "Applied", value: statusMap.applied },
      { name: "Accepted", value: statusMap.accepted },
      { name: "Rejected", value: statusMap.rejected },
    ];

    const latestUsers = await prisma.user.findMany({
      where: {
        OR: [
          { teacher: { university_id: universityId } },
          { student: { university_id: universityId } },
        ],
        ...(year && {
          createdAt: { gte: startDate, lt: endDate },
        }),
      },
      select: {
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const formattedLatestUsers = latestUsers.map((user) => ({
      name: user.name,
      role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      message: "University dashboard data fetched successfully",
      data: {
        totalTeachers,
        totalStudents,
        totalApplicationsSubmitted,
        applicationStatusData,
        latestUsers: formattedLatestUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching university dashboard data:", error);
    return NextResponse.json(
      {
        message: "Error fetching dashboard data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
