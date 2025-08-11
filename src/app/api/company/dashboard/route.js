import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const yearParam =
      searchParams.get("year") || new Date().getFullYear().toString();
    const year = Number(yearParam);

    const company = await prisma.company.findFirst({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company profile not found" },
        { status: 404 }
      );
    }

    const totalPosts = await prisma.internshipPost.count({
      where: { company_id: company.id },
    });

    const totalApplications = await prisma.internshipApplication.count({
      where: {
        post: {
          company_id: company.id,
        },
        applied_at: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });

    // Count of saved posts for this company's posts
    const totalSavedPosts = await prisma.savedPost.count({
      where: {
        internshipPost: {
          company_id: company.id,
        },
      },
    });

    const statusCounts = await prisma.internshipApplication.groupBy({
      by: ["status"],
      where: {
        post: {
          company_id: company.id,
        },
        applied_at: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
      _count: true,
    });

    const applicationStatus = {
      applied: statusCounts.find((s) => s.status === "applied")?._count || 0,
      accepted: statusCounts.find((s) => s.status === "accepted")?._count || 0,
      rejected: statusCounts.find((s) => s.status === "rejected")?._count || 0,
    };

    return NextResponse.json({
      totalApplications,
      totalPosts,
      totalSavedPosts,
      applicationStatus,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
