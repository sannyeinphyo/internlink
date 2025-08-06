import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, studentId, applicationId, scheduledAt, location, type } =
      await req.json();

    if (!postId || !studentId || !applicationId || !scheduledAt || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }
    const existingInterview = await prisma.interview.findUnique({
      where: {
        application_id: applicationId,
      },
    });

    if (existingInterview) {
      return NextResponse.json(
        { message: "Interview already exists for this application" },
        { status: 400 }
      );
    }

    const interview = await prisma.interview.create({
      data: {
        post_id: postId,
        student_id: studentId,
        company_id: company.id,
        application_id: applicationId,
        scheduledAt: new Date(scheduledAt),
        location,
        type,
        status: "PENDING",
      },
    });
    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const interviews = await prisma.interview.findMany({
      where: {
        company_id: company.id,
      },
      include: {
        student: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            major: true,
            batch_year: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
        application: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return NextResponse.json(interviews, { status: 200 });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
