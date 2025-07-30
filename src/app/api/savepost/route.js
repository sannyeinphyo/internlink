import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { internship_post_id } = body;

  try {
    const saved = await prisma.savedPost.create({
      data: {
        user_id: session.user.id,
        internship_post_id,
      },
    });
    return NextResponse.json({ message: "Saved", saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error saving post", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const savedPosts = await prisma.savedPost.findMany({
    where: { user_id: session.user.id },
    include: { internshipPost: true },
  });

  return NextResponse.json({ data: savedPosts }, { status: 200 });
}
