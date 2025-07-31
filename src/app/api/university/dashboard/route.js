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

  const universityUserId = session.user.id; 

  if (!universityUserId) {
    return NextResponse.json(
      { message: "User ID not found in session for university role. Please log in again." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear(); 

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  try {
    const university = await prisma.university.findUnique({
      where: { user_id: universityUserId },
      select: { id: true },
    });

    if (!university) {
      return NextResponse.json(
        { message: "University profile not found for the logged-in university user." },
        { status: 404 }
      );
    }

    const universityId = university.id;

    const totalTeachers = await prisma.teacher.count({
      where: { university_id: universityId },
    });
    const totalStudents = await prisma.student.count({
      where: { university_id: universityId },
    });

    const totalApplicationsSubmitted = await prisma.internshipApplication.count(
      {
        where: {
          student: { university_id: universityId },
          applied_at: { gte: startDate, lt: endDate },
        },
      }
    );

    const statusCounts = await prisma.internshipApplication.groupBy({
      by: ["status"],
      _count: { status: true },
      where: {
        student: { university_id: universityId },
        applied_at: { gte: startDate, lt: endDate },
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

    const yearsFromUsers = await prisma.user.findMany({
      where: {
        OR: [
          { teacher: { university_id: universityId } },
          { student: { university_id: universityId } },
        ],
      },
      select: { createdAt: true },
    });

    const yearsFromApplications = await prisma.internshipApplication.findMany({
      where: {
        student: { university_id: universityId },
      },
      select: { applied_at: true },
    });

    const allYearsSet = new Set();
    yearsFromUsers.forEach(u => allYearsSet.add(new Date(u.createdAt).getFullYear()));
    yearsFromApplications.forEach(a => allYearsSet.add(new Date(a.applied_at).getFullYear()));

    const currentFullYear = new Date().getFullYear();
    for (let i = -2; i <= 2; i++) {
        allYearsSet.add(currentFullYear + i);
    }

    const allAvailableYears = Array.from(allYearsSet).sort((a, b) => b - a);

    const latestUsers = await prisma.user.findMany({
      where: {
        OR: [
          { teacher: { university_id: universityId } },
          { student: { university_id: universityId } },
        ],
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const formattedLatestUsers = latestUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
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
        allAvailableYears,
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