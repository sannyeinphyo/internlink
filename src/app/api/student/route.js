import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findMany({
      include: {
        user: true,
        university: true,
      },
    });
    return NextResponse.json({
      message: "Getting student information",
      student,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { message: "Error getting student information" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received POST body:", body);

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
      university_id,
      student_id_image,
    } = body;


    const hashedPassword = await bcrypt.hash(password, 10);
    const linkedIn = body.linkedIn || body.linkedln || null;

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

    if (role === "student") {
      await prisma.student.create({
        data: {
          user_id: user.id,
          batch_year: parseInt(batch_year),
          major,
          skills: skills || null,
          facebook: facebook || null,
          linkedIn,
          university_id: parseInt(university_id),
          student_id_image:student_id_image,
        },
      });
    }

    return NextResponse.json({ message: "Student Created", user });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { message: "Error Creating Student", error: error.message },
      { status: 500 }
    );
  }
}
