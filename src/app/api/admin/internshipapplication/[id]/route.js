// src/app/api/admin/internshipapplication/[id]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to safely format dates
const formatDate = (date) => {
  if (!date) return null;
  try {
    return date.toISOString().split("T")[0];
  } catch (e) {
    console.error("Error formatting date:", date, e);
    return null; // Return null if date formatting fails
  }
};

// GET request to fetch a single internship application by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
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
            // Removed 'updatedAt' as it does not exist on the InternshipPost model based on your schema
            company: {
              select: {
                id: true,
                name: true,
                location: true,
                contact_info: true,
                description: true,
                website: true,
                facebook: true,
                user_id: true, // Include user_id to potentially link to company user details
                image: true, // Assuming Company model has an image field
              },
            },
          },
        },
        student: {
          include: {
            user: {
              // User model related to the Student
              select: {
                id: true,
                name: true,
                email: true,
                image: true, // Include image for student avatar
                status: true, // This 'status' is correct for the User model
                verified: true,
              },
            },
            university: true, // Include university details for the student
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

    // Safely format dates and handle potentially missing nested objects
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
            // Removed 'updatedAt' from formatting as it's no longer selected
            company: application.post.company
              ? {
                  // Ensure company exists before spreading
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
