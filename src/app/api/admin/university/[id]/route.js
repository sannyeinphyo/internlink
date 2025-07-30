// src/app/api/admin/university/[id]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET request to fetch a single university user by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "Your Not Authorized" },
      { status: 403 }
    ); // 403 Forbidden
  }

  try {
    const { id } = params; // Extract the university ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { message: "University ID is required" },
        { status: 400 }
      );
    }

    // Convert id to an integer, as Prisma IDs are typically integers
    const universityId = parseInt(id, 10);
    if (isNaN(universityId)) {
      return NextResponse.json(
        { message: "Invalid University ID" },
        { status: 400 }
      );
    }

    // Find the user with the given ID and 'university' role, including their university details
    const universityUser = await prisma.user.findUnique({
      where: {
        id: universityId,
        role: "university",
      },
      include: {
        university: true, // Include the associated university profile
      },
    });

    if (!universityUser) {
      return NextResponse.json(
        { message: "University not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "University details fetched successfully",
      data: universityUser, // Return the full university user object with nested university data
    });
  } catch (error) {
    console.error("Error fetching university details:", error);
    return NextResponse.json(
      {
        message: "Error fetching university details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
