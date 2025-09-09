import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  sendApplicationAcceptEmail,
  sendApplicationRejectEmail,
  sendInterviewScheduledEmail,
} from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const company = await prisma.company.findFirst({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return new Response(JSON.stringify({ message: "Company not found" }), {
        status: 404,
      });
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        post: {
          company_id: company.id,
        },
      },
      include: {
        post: { select: { id: true, title: true } },
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        Interview: true,
      },
      orderBy: {
        applied_at: "desc",
      },
    });

    return new Response(JSON.stringify({ applications }), { status: 200 });
  } catch (error) {
    console.error("Error fetching applications for company:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { student_id, post_id, status } = body;

  if (!student_id || !post_id || !status) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.internshipApplication.findFirst({
      where: {
        student_id: Number(student_id),
        post_id: Number(post_id),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        post: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.internshipApplication.updateMany({
      where: {
        student_id: Number(student_id),
        post_id: Number(post_id),
      },
      data: {
        status,
      },
    });

    if (status === "accepted") {
      await prisma.notification.create({
        data: {
          user_id: application.student.user.id,
          title: `Application Accepted`,
          body: `Your application for "${
            application.post.title
          }" has been accepted.\n\nPlease contact the company at ${
            application.post.contact_email || "example@example.com"
          } to schedule your interview.`,
        },
      });

      await sendApplicationAcceptEmail(
        application.student.user.email,
        application.student.user.name,
        application.post.title,
        application.post.contact_email || "example@example.com"
      );
    } else if (status === "rejected") {
      await prisma.notification.create({
        data: {
          user_id: application.student.user.id,
          title: `Application Rejected`,
          body: `Your application for "${application.post.title}" has been rejected.`,
        },
      });

      await sendApplicationRejectEmail(
        application.student.user.email,
        application.student.user.name,
        application.post.title
      );
    }

    return NextResponse.json({ message: "Status updated", updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { application_id, scheduledAt, location, type } = body;

  if (!application_id || !scheduledAt || !type) {
    return NextResponse.json(
      { message: "Missing required fields: application_id, scheduledAt, type" },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.internshipApplication.findUnique({
      where: { id: application_id },
      include: {
        post: true,
        student: {
          include: { user: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { user_id: session.user.id },
    });

    if (!company || company.id !== application.post.company_id) {
      return NextResponse.json(
        { message: "Unauthorized for this application" },
        { status: 403 }
      );
    }

    // Create the interview record
    const interview = await prisma.interview.create({
      data: {
        post_id: application.post.id,
        company_id: company.id,
        student_id: application.student.id,
        application_id: application.id,
        scheduledAt: new Date(scheduledAt),
        location,
        type,
        status: "PENDING",
      },
    });

    // Send interview scheduled email
    try {
      await sendInterviewScheduledEmail(
        application.student.user.email,
        application.student.user.name,
        application.post.title,
        scheduledAt,  // Pass scheduledAt correctly here
        location
      );
      console.log("Interview email sent");
    } catch (e) {
      console.error("Interview email failed:", e);
    }

    // Create notification for the student
    try {
      await prisma.notification.create({
        data: {
          user_id: application.student.user.id,
          title: `Interview Scheduled`,
          body: `Your interview for "${
            application.post.title
          }" has been scheduled on ${new Date(
            scheduledAt
          ).toLocaleString()}. Location: ${location || "To be confirmed"}.`,
        },
      });
      console.log("Interview notification created");
    } catch (e) {
      console.error("Interview notification creation failed:", e);
    }

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

