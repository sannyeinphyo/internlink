// app/api/admin/reviewaccount/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  // 1. Validate the 'role' parameter from the URL query
  if (!role || (role !== "company" && role !== "student")) {
    return NextResponse.json(
      {
        error:
          'Invalid or missing role parameter. It must be either "company" or "student".',
      },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }

  try {
    // 2. Fetch users from the database with the specified role and a 'pending' status
    const pendingAccounts = await prisma.user.findMany({
      where: {
        role: role,
        status: "pending", // This is the key filter for your review queue
      },
      // 3. Conditionally include the related data based on the role
      include: {
        // If role is 'company', include the company profile. Otherwise, don't.
        company: role === "company",
        // If role is 'student', include the student profile and their university. Otherwise, don't.
        student:
          role === "student"
            ? {
                include: {
                  university: true,
                },
              }
            : false,
      },
      orderBy: {
        createdAt: "asc", // Order by creation date to review the oldest accounts first
      },
    });

    // 4. Return the list of pending accounts
    return NextResponse.json(pendingAccounts);
  } catch (error) {
    console.error(`Error fetching pending ${role} accounts:`, error);
    // In a production environment, avoid sending raw error details to the client
    return NextResponse.json(
      {
        error: `An internal server error occurred while fetching pending ${role}s.`,
      },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma Client after the request (important for serverless)
    await prisma.$disconnect();
  }
}
