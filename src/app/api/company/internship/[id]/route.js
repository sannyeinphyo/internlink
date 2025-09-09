import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid job post ID" },
        { status: 400 }
      );
    }

    // Find the company profile linked to the logged-in user
    const company = await prisma.company.findUnique({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company profile not found" },
        { status: 404 }
      );
    }

    // Find the internship post by id, ensuring it belongs to this company
    const job = await prisma.internshipPost.findUnique({
      where: { id },
      include: {
        company: true,
        applications: {
          include: {
            student: true,  // optionally include student details
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Internship post not found" },
        { status: 404 }
      );
    }

    // Ensure the post belongs to the logged-in company
    if (job.company_id !== company.id) {
      return NextResponse.json(
        { message: "You are not authorized to view this internship post" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Getting internship detail for company...",
      data: job,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error getting internship detail",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
