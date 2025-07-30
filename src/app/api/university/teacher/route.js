// src/app/api/university/teacher/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as yup from "yup";
import { teacherSchema } from "@/schemas/universityCreateAccount";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth"; 

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "university" || !session.user.id) {
    return NextResponse.json(
      { message: "You are not authorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    await teacherSchema.validate(body, { abortEarly: false });

    const { name, email, password, role, university_id, department } = body;

    if (session.user.id !== university_id) {
      return NextResponse.json(
        {
          message:
            "Unauthorized: Account creation must be for your university.",
        },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "approved",
        verified: true,
      },
    });

    await prisma.teacher.create({
      data: {
        user_id: user.id,
        university_id: university_id,
        department: department,
      },
    });

    return NextResponse.json(
      {
        message: "Successfully created teacher account",
        user_id: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error Creating Teacher Account:", error);
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    session.user.role !== "university" ||
    !session.user.id
  ) {
    return NextResponse.json(
      { message: "You are not authorized" },
      { status: 401 }
    );
  }
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "teacher",
        teacher: {
          university_id: session.user.id,
        },
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json({
      message: "Getting all teacher users for your university...",
      data: teachers,
    });
  } catch (error) {
    console.error("Error fetching teacher users:", error);
    return NextResponse.json(
      {
        message: "Error fetching teacher users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
