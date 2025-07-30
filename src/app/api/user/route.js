import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
  const session = getServerSession(authOptions);
  try {
    const user = await prisma.user.findMany({});
    return NextResponse.json({
      message: "Getting student information",
      data:user,
    });
  } catch (error) {
    return NextResponse.json({ message: "Error getting student information" });
  }
}

