import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      image,
      status,
      university_id ,
      department,
    } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password :hashedPassword,
        role,
        image: image || null,
        status: status || "pending",
      },
    });
    if (body.role === "teacher") {
      await prisma.teacher.create({
        data: {
          user_id: user.id,
          university_id ,
          department,
        },
      });
    }
    return NextResponse.json(
      { message: "Teacher creating sucessful ...",   user }
   
    );
  } catch (error) {
    return NextResponse.json({
      message: "Error Creating Teacher",
      error: error.message,
    });
  }
}
