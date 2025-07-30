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
    const student = await prisma.user.findMany({
      where: {
        role: "student", // Make sure to only fetch users with the 'student' role
      },
      include: {
        student: {
          // Include the Student model related to the User
          include: {
            university: true, // This further includes the University model related to the Student
          },
        },
      },
    });

    return NextResponse.json({
      message: "Getting all student users...",
      data: student,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error fetching student users",
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
      batch_year,
      major,
      skills,
      facebook,
      linkedIn,
      university_id,
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

    if (body.role === "student") {
      const student = await prisma.student.create({
        data: {
          user_id: user.id,
          batch_year,
          major,
          skills: skills || null,
          facebook: facebook || null,
          linkedIn: linkedIn || null,
          university_id,
        },
      });
    }

    return NextResponse.json({ message: "Student Created...", user });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { message: "Error Creating", error: error.message },
      { status: 500 }
    );
  }
}
