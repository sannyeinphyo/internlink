import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "admin" && session.user.role !== "student")) {
    return NextResponse.json(
      { message: "You are not authorized" },
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

    const deletedApplication = await prisma.internshipApplication.delete({
      where: {
        id: applicationId,
      },
    });

    return NextResponse.json(
      {
        message: "Internship application deleted successfully",
        deletedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting internship application:", error);
    return NextResponse.json(
      {
        message: "Error deleting internship application",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
