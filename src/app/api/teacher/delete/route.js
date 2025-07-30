import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import {prisma} from "@/lib/prisma"; 

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    await prisma.teacher.delete({
      where: { user_id: userId },
    });

    return NextResponse.json({ message: "Teacher account deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Teacher delete error:", error);
    return NextResponse.json({ error: "Server error while deleting teacher" }, { status: 500 });
  }
}
