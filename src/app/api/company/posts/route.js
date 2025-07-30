import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const {
      title,
      description,
      requirements,
      paid,
      salary,
      location,
      start_date,
      end_date,
      job_type,
      application_deadline,
      benefits,
      contact_email,
      remote,
      positions,
      responsibilities,
    } = data;

    const newPost = await prisma.internshipPost.create({
      data: {
        title,
        description,
        requirements,
        paid,
        salary: paid ? salary : null,
        location,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        job_type,
        application_deadline: application_deadline
          ? new Date(application_deadline)
          : null,
        benefits,
        contact_email,
        remote,
        positions,
        responsibilities,
        company: {
          connect: { user_id: session.user.id },
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating internship post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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

    const posts = await prisma.internshipPost.findMany({
      where: {
        company_id: company.id,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
