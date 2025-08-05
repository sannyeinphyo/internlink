import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const formatDate = (date) => {
  if (!date) return null;
  try {
    return date.toISOString().split("T")[0];
  } catch (e) {
    console.error("Error formatting date:", date, e);
    return null; 
  }
};

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "company") {
    return NextResponse.json(
      { message: "Your Not Authorized" },
      { status: 403 }
    );
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Internship Application ID is required" },
        { status: 400 }
      );
    }

    const applicationId = parseInt(id, 10);
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid Internship Application ID" },
        { status: 400 }
      );
    }

    const application = await prisma.internshipApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            responsibilities: true,
            benefits: true,
            application_deadline: true,
            createdAt: true,
            company: {
              select: {
                id: true,
                name: true,
                location: true,
                contact_info: true,
                description: true,
                website: true,
                facebook: true,
                user_id: true, 
                image: true, 
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true, 
                status: true, 
                verified: true,
              },
            },
            university: true, 
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Internship Application not found" },
        { status: 404 }
      );
    }

    const formattedApplication = {
      ...application,
      applied_at: formatDate(application.applied_at),
      post: application.post
        ? {
            ...application.post,
            application_deadline: formatDate(
              application.post.application_deadline
            ),
            createdAt: formatDate(application.post.createdAt),
            company: application.post.company
              ? {
                  ...application.post.company,
                }
              : null,
          }
        : null,
      student: application.student
        ? {
            ...application.student,
            user: application.student.user
              ? {
                  ...application.student.user,
                }
              : null,
            university: application.student.university
              ? {
                  ...application.student.university,
                }
              : null,
          }
        : null,
    };

    return NextResponse.json({
      message: "Internship Application details fetched successfully",
      data: formattedApplication,
    });
  } catch (error) {
    console.error("Error fetching internship application details:", error);
    return NextResponse.json(
      {
        message: "Error fetching internship application details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
