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
    const { id } = params; // Extract the company ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { message: "company ID is required" },
        { status: 400 }
      );
    }

    // Convert id to an integer, as Prisma IDs are typically integers
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return NextResponse.json(
        { message: "Invalid company ID" },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: companyId,
        role: "company", // Ensure we're only deleting users with the 'company' role
      },
    });

    if (!deletedUser) {
      return NextResponse.json(
        { message: "company not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "company deleted successfully",
        deletedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      {
        message: "Error deleting company",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
