// app/api/admin/internshipapplication/[id]/delete/route.js
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
    const { id } = params; // Extract the application ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { message: "Internship Application ID is required" },
        { status: 400 }
      );
    }

    // Convert id to an integer
    const applicationId = parseInt(id, 10);
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid Internship Application ID" },
        { status: 400 }
      );
    }

    // Delete the internship application record
    const deletedApplication = await prisma.internshipApplication.delete({
      where: {
        id: applicationId,
      },
    });

    if (!deletedApplication) {
      return NextResponse.json(
        { message: "Internship application not found or could not be deleted" },
        { status: 404 }
      );
    }

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
