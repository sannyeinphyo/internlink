// app/api/admin/reviewaccount/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Centralized Prisma client import
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// --- GET method (existing) ---
export async function GET(request, { params }) {
  // Correct way to extract id: Access params.id, then parse it.
  const userId = parseInt(params.id);

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID format." },
      { status: 400 }
    );
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        company: true,
        student: {
          include: {
            university: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  } finally {
    // Only disconnect if Prisma client is not managed globally (e.g., in development mode)
    // For a robust setup, ensure you have a global Prisma client instance to avoid multiple disconnections.
    // await prisma.$disconnect(); // Consider removing this if prisma is global and managed externally
  }
}

// --- PATCH method (for updating user status) ---
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  // Correct way to extract id: Access params.id (it's a string here)
  const userId = params.id;
  const { status } = await request.json(); // Expecting { status: 'approved' | 'declined' }

  // Validate userId by parsing it to int
  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) {
    return NextResponse.json(
      { error: "Invalid user ID format." },
      { status: 400 }
    );
  }

  // Validate the status value
  const validStatuses = ["approved", "declined"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status provided. Must be 'approved' or 'declined'." },
      { status: 400 }
    );
  }

  try {
    // Update the user's status in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: parsedUserId, // Use the parsed integer ID here
      },
      data: {
        status: status, // Update the status field
        verified: status === "approved" ? true : false, // Optionally update 'verified' based on status
      },
    });

    // Return the updated user object (or a success message)
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(
      `Failed to update user ${userId} status to ${status}:`,
      error
    );

    // More specific error handling could be added here (e.g., if user not found for update)
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { error: "User not found for update." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "An internal server error occurred during status update." },
      { status: 500 }
    );
  } finally {
    // Only disconnect if Prisma client is not managed globally (e.g., in development mode)
    // await prisma.$disconnect(); // Consider removing this if prisma is global and managed externally
  }
}
