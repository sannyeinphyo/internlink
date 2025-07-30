import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const internship_post_id = parseInt(params.id);
    if (isNaN(internship_post_id)) {
      return NextResponse.json(
        { message: "Invalid internship_post_id" },
        { status: 400 }
      );
    }

    await prisma.savedPost.deleteMany({
      where: {
        user_id: session.user.id,
        internship_post_id,
      },
    });

    return NextResponse.json(
      { message: "Saved post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/savepost/[id] error:", error);
    return NextResponse.json(
      { message: "Error deleting saved post", error: error.message },
      { status: 500 }
    );
  }
}
