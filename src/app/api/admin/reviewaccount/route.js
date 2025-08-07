import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

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
    const pendingAccounts = await prisma.user.findMany({
      where: {
        role: role,
        status: "pending", 
      },
      include: {
        company: role === "company",
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
        createdAt: "asc", 
      },
    });

    return NextResponse.json(pendingAccounts);
  } catch (error) {
    console.error(`Error fetching pending ${role} accounts:`, error);
    return NextResponse.json(
      {
        error: `An internal server error occurred while fetching pending ${role}s.`,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
