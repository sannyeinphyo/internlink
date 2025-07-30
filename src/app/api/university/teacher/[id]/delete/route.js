import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "university") {
    return NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  const universityIdFromSession = session.user.id;
  if (!universityIdFromSession) {
    console.warn(
      "API: University session found, but university_id is missing."
    );
    return NextResponse.json(
      { message: "University ID not found in session." },
      { status: 403 }
    );
  }
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: "teacher ID is required" },
        { status: 400 }
      );
    }
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
        role: "teacher",
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
