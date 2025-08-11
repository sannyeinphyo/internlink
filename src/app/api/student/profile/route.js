import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { user_id: session.user.id },
      include: {
        university: {
          include :{
            user:true,
          }
        },
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { name, email, major, batchYear, skills, facebook, linkedin, Github, image , student_id_image } = body;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        image: image || null,
      },
    });

    const updatedStudent = await prisma.student.update({
      where: { user_id: session.user.id },
      data: {
        major,
        batch_year: batchYear,
        skills: typeof skills === "string" ? skills : skills.join(", "),
        facebook: facebook || null,
        linkedIn: linkedin || null,
        Github: Github || null,
        student_id_image: student_id_image || "",
      },
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("PUT /api/student/profile error:", error);  // <---- Add this
    return NextResponse.json({ message: "Failed to update profile", error: error.message }, { status: 500 });
  }
}
