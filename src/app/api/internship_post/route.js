import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    let studentId = null;

    if (session?.user?.role === "student") {
      const student = await prisma.student.findUnique({
        where: { user_id: session.user.id },
        select: { id: true },
      });
      studentId = student?.id ?? null;
    }

    const posts = await prisma.internshipPost.findMany({
      select: {
        id: true,
        title: true,
        requirements: true,
        createdAt: true,
        description: true,
        location: true,
        job_type: true,
        paid: true,
        company: {
          select: {
            id: true,
            name: true,
            image:true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },

        applications: studentId
          ? {
              where: { student_id: studentId },
              select: {
                status: true,
              },
            }
          : false,
      },
    });

    return NextResponse.json({
      message: "Getting internship previews...",
      data: posts,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error getting internship previews",
      error: error.message,
    });
  }
}
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "company") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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
    } = body;

    const newPost = await prisma.internshipPost.create({
      data: {
        company_id: session.user.id,
        title,
        description,
        requirements,
        paid,
        salary,
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
      },
    });

    return NextResponse.json(
      { message: "Internship post created", data: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating internship post:", error);
    return NextResponse.json(
      { message: "Error creating internship post", error: error.message },
      { status: 500 }
    );
  }
}
