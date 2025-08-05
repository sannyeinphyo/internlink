import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findFirst({
      where: { user_id: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        student_id: student.id,
      },
      include: {
        post: true,
        Interview: true,
      },
    });

    console.log("Applications fetched:", applications);

    return NextResponse.json({
      message: "Getting internship applications",
      data: applications,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error getting applications",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const student = await prisma.student.findFirst({
      where: { user_id: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.internshipApplication.findFirst({
      where: {
        post_id: body.post_id,
        student_id: student.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You already applied to this internship." },
        { status: 400 }
      );
    }

    const application = await prisma.internshipApplication.create({
      data: {
        post_id: body.post_id,
        student_id: student.id,
        status: body.status || "applied",
      },
    });

    const post = await prisma.internshipPost.findUnique({
      where: { id: body.post_id },
      include: {
        company: {
          select: { user_id: true },
        },
      },
    });

    if (post?.company?.user_id) {
      await prisma.notification.create({
        data: {
          user_id: post.company.user_id,
          title: "New Internship Application",
          body: `${
            session.user.name || "A student"
          } has applied to your post "${post.title}".`,
        },
      });
    }

    return NextResponse.json({
      message: "Internship has been applied",
      data: application,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      error.inner.forEach((err) => {
        if (err.path) errors[err.path] = err.message;
      });

      return NextResponse.json(
        {
          message: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Error applying for internship",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
