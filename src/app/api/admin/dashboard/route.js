import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to access this panel" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const yearParam =
      searchParams.get("year") || new Date().getFullYear().toString();
    const year = Number(yearParam);

    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));

    const companyPosts = await prisma.internshipPost.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: { id: true },
    });

    const postIds = companyPosts.map((post) => post.id);

    const companyApplications = await prisma.internshipApplication.findMany({
      where: {
        post_id: { in: postIds },
        applied_at: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const totalApplications = companyApplications.length;

    const statusCounts = await prisma.internshipApplication.groupBy({
      by: ["status"],
      where: {
        post_id: { in: postIds },
        applied_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: true,
    });

    const applicationStatus = {
      applied: statusCounts.find((s) => s.status === "applied")?._count || 0,
      accepted: statusCounts.find((s) => s.status === "accepted")?._count || 0,
      rejected: statusCounts.find((s) => s.status === "rejected")?._count || 0,
    };

    const totalStudents = await prisma.student.count({
      where: {
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    });

    const totalTeachers = await prisma.Teacher.count({
      where: {
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    });

    const totalUniversity = await prisma.University.count({
      where: {
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    });

    const totalCompanies = await prisma.company.count({
      where: {
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    });

    const totalAdmins = await prisma.user.count({
      where: { role: "admin" }, // Assuming admins are not filtered by createdAt (or you can filter here too)
    });

    const totalPosts = companyPosts.length;

    const verifiedCount = await prisma.user.count({
      where: {
        verified: true,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const unverifiedCount = await prisma.user.count({
      where: {
        verified: false,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { user: { createdAt: "desc" } },
      where: {
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
      },
    });

    const recentCompanies = await prisma.company.findMany({
      take: 5,
      orderBy: { user: { createdAt: "desc" } },
      where: {
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
      },
    });

    const monthlyApplications = await prisma.internshipApplication.findMany({
      where: {
        applied_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        applied_at: true,
      },
    });

    // Group by month number
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const count = monthlyApplications.filter((a) => {
        const date = new Date(a.applied_at);
        return date.getUTCMonth() + 1 === month;
      }).length;
      return { month, applications: count };
    });

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalUniversity,
      totalCompanies,
      totalAdmins,
      totalUsers:
        totalStudents +
        totalTeachers +
        totalCompanies +
        totalAdmins +
        totalUniversity,
      totalPosts,
      totalApplications,
      applicationStatus,
      accountVerification: {
        verified: verifiedCount,
        unverified: unverifiedCount,
      },
      recentStudents,
      recentCompanies,
      monthlyStats,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
