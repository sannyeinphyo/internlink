// src/app/api/admin/company/[id]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET request to fetch a single company user by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "Your Not Authorized" },
      { status: 403 }
    ); // 403 Forbidden
  }

  try {
    const { id } = params; // Extract the company ID from the URL parameters

    if (!id) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 }
      );
    }

    // Convert id to an integer, as Prisma IDs are typically integers
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return NextResponse.json(
        { message: "Invalid Company ID" },
        { status: 400 }
      );
    }

    // Find the user with the given ID and 'company' role, including their company details
    const companyUser = await prisma.user.findUnique({
      where: {
        id: companyId,
        role: "company",
      },
      include: {
        company: true, // Include the associated company details
      },
    });

    if (!companyUser) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Company details fetched successfully",
      data: companyUser, // Return the full company user object with nested company data
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    return NextResponse.json(
      {
        message: "Error fetching company details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
