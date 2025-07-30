//api/admin/university/[id]/delete/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
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
        { message: "Invalid university ID" },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: universityId,
        role: "university", // Ensure we're only deleting users with the 'university' role
      },
    });

    if (!deletedUser) {
      return NextResponse.json(
        { message: "university not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "University deleted successfully",
        deletedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting university:", error);
    return NextResponse.json(
      {
        message: "Error deleting university",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
