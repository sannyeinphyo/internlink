import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        post: {
          include: {
            company: true,
          },
        },
        application: true,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.post.companyId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(interview, { status: 200 });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "company" && session.user.role !== "student")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const interviewId = parseInt(id, 10);
  const { status, scheduledAt } = await req.json();

  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        company: true,
        post: true,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    if (
      (session.user.role === "company" &&
        interview.company.user_id !== session.user.id) ||
      (session.user.role === "student" &&
        interview.student.user_id !== session.user.id)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = {};

    if (status) {
      if (!["ACCEPTED", "REJECTED", "CANCELLED"].includes(status)) {
        return NextResponse.json(
          { message: "Invalid status" },
          { status: 400 }
        );
      }

      if (interview.status !== "PENDING") {
        return NextResponse.json(
          { message: "Interview already responded" },
          { status: 400 }
        );
      }

      data.status = status;
    }

    if (scheduledAt) {
      const parsedDate = new Date(scheduledAt);
      if (isNaN(parsedDate)) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
      }
      data.scheduledAt = parsedDate;
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data,
    });

    if (status) {
      await prisma.notification.create({
        data: {
          user_id: interview.company.user_id,
          title: `Interview ${status.toLowerCase()}`,
          body: `Student ${
            interview.student.user.name
          } has ${status.toLowerCase()} the interview for "${
            interview.post.title
          }".`,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Interview updated successfully",
        interview: updatedInterview,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
