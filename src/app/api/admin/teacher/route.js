import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const teacher = await prisma.user.findMany({
      // Renamed 'teacher' to 'teachers' for clarity
      where: {
        role: "teacher",
      },
      include: {
        teacher: {
          // This includes the Teacher model related to the User
          include: {
            university: true, // This further includes the University model related to the Teacher
          },
        },
      },
    });

    return NextResponse.json({
      message: "Getting all teacher users...",
      data: teacher,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error fetching teacher users",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const body = await req.json();
    const {
      name,
      username,
      email,
      password,
      role,
      image,
      status,
      university_id,
      department,
    } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role,
        image: image || null,
        status: status || "pending",
      },
    });
    if (body.role === "teacher") {
      await prisma.teacher.create({
        data: {
          user_id: user.id,
          university_id,
          department,
        },
      });
    }
    return NextResponse.json({
      message: "Teacher creating sucessful ...",
      user,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error Creating Teacher",
      error: error.message,
    });
  }
}
