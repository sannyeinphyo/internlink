import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized: No session found" },
      { status: 401 }
    );
  }

  if (session.user.role !== "university" || !session.user.id) {
    return NextResponse.json(
      { message: "Forbidden: You do not have the necessary permissions" },
      { status: 403 }
    );
  }

  const studentUserId = params.id;

  if (!studentUserId) {
    return NextResponse.json(
      { message: "Student User ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const userToDelete = await tx.user.findUnique({
        where: { id: studentUserId },
        include: { student: true },
      });

      if (!userToDelete) {
        throw new Error("Student (User) not found.");
      }

      if (
        !userToDelete.student ||
        userToDelete.student.universityId !== session.user.university_id
      ) {
        throw new Error(
          "Forbidden: You can only delete students associated with your university."
        );
      }

      if (userToDelete.student) {
        await tx.student.delete({
          where: { id: userToDelete.student.id },
        });
      }

      const deletedUser = await tx.user.delete({
        where: {
          id: studentUserId,
          role: "student",
        },
      });

      return {
        message: "Student and associated user deleted successfully",
        deletedUser,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error deleting student:", error);
    if (error.message.includes("Student (User) not found.")) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }
    if (error.message.includes("Forbidden:")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json(
      {
        message: "Failed to delete student.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
