// src/app/api/university/student/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as yup from "yup";
import { studentSchema } from "@/schemas/universityCreateAccount"; // Ensure this import is correct
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    console.warn(
      "API: Unauthorized POST attempt to /api/university/student - No session."
    );
    return NextResponse.json(
      { message: "You are not authenticated." },
      { status: 401 }
    );
  }

  if (session.user.role !== "university" && session.user.role !== "admin") {
    console.warn(
      `API: Unauthorized POST attempt to /api/university/student - Role: ${session.user.role}.`
    );
    return NextResponse.json(
      { message: "You are not authorized to create students." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    // This line will now correctly validate 'skills' as a string
    await studentSchema.validate(body, { abortEarly: false });

    const {
      name,
      email,
      password,
      role,
      university_id: submittedUniversityId,
      batch_year,
      major,
      skills, // 'skills' is now a string from the frontend
      facebook,
      linkedIn,
    } = body;

    const userId = session.user.id;
    const university = await prisma.university.findUnique({
      where: { user_id: userId },
    });

    if (!university) {
      console.error(
        `API: University not found for user ID ${userId} during student creation.`
      );
      return NextResponse.json(
        {
          message:
            "University not found for your user account. Please contact admin.",
        },
        { status: 404 }
      );
    }

    const university_id = university.id;

    if (
      session.user.role === "university" &&
      parseInt(submittedUniversityId, 10) !== university_id
    ) {
      console.warn(
        `API: University ${university_id} attempted to create student for university ${submittedUniversityId}. Unauthorized.`
      );
      return NextResponse.json(
        {
          message:
            "Unauthorized: You can only create students for your own university.",
        },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.warn(
        `API: Attempt to create student with existing email: ${email}.`
      );
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
        role: "student",
        status: "approved",
        verified: true,
      },
    });

    await prisma.student.create({
      data: {
        user_id: user.id,
        university_id: university_id,
        batch_year: parseInt(batch_year, 10),
        major: major,
        skills: Array.isArray(skills) ? skills.join(", ") : skills || null,
        facebook: facebook || null,
        linkedIn: linkedIn || null,
      },
    });

    console.log(
      `API: Student '${name}' created successfully for university ID: ${university_id}.`
    );
    return NextResponse.json(
      {
        message: "Successfully created student account",
        user_id: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error Creating Student Account:", error);
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

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "You are not authenticated." },
      { status: 401 }
    );
  }

  if (session.user.role !== "university" && session.user.role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  let sessionUniversityId = null;

  if (session.user.role === "university") {
    const university = await prisma.university.findUnique({
      where: { user_id: session.user.id },
    });

    if (!university) {
      return NextResponse.json(
        { message: "University not found for your account." },
        { status: 404 }
      );
    }

    sessionUniversityId = university.id;
  }

  try {
    const whereClause = { role: "student" };

    if (session.user.role === "university") {
      whereClause.student = {
        university_id: sessionUniversityId,
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            university: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "Students fetched successfully for university.",
        data: students,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error fetching university students:", error);
    return NextResponse.json(
      {
        message: "Error fetching students for university.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
