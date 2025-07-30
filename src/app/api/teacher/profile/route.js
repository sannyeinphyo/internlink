import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true, 
          },
        },
        university: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher profile not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Teacher profile found", teacher });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching teacher profile", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {
 
    const { name, image, department } = await req.json();


    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, image },
    });

    const updatedTeacher = await prisma.teacher.update({
      where: { user_id: session.user.id },
      data: { department },
      include: {
        user: true,
        university: true,
      },
    });

    return NextResponse.json({ message: "Teacher profile updated", teacher: updatedTeacher });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating teacher profile", error: error.message },
      { status: 500 }
    );
  }
}
