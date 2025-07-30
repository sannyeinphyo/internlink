import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const studentId = parseInt(params.id);
  if (isNaN(studentId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
const student = await prisma.student.findUnique({
  where: { user_id: session.user.id },
  include: { university: true, user: true },
});

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: student }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
