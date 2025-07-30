//api/admin/teacher/[id]/delete/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const { id } = params; // Extract the teacher ID from the URL parameters
    if (!id) {
      return NextResponse.json(
        { message: "teacher ID is required" },
        { status: 400 }
      );
    }
    // Convert id to an integer, as Prisma IDs are typically integers
    const teacherId = parseInt(id, 10);
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { message: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: teacherId,
        role: "teacher", // Ensure we're only deleting users with the 'teacher' role
      },
    });

    if (!deletedUser) {
      return NextResponse.json(
        { message: "teacher not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Teacher deleted successfully",
        deletedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      {
        message: "Error deleting teacher",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
