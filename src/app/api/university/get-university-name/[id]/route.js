import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // make sure this path is correct
import { getServerSession } from "next-auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const userWithUniversity = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!userWithUniversity?.university) {
      return NextResponse.json(
        { message: "University not found for this user." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: userWithUniversity.university.id,
        name: userWithUniversity.university.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching university:", error);
    return NextResponse.json(
      { message: "Server error while fetching university." },
      { status: 500 }
    );
  }
}
