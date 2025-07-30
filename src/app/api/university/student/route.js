import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as yup from "yup";
import { studentSchema } from "@/schemas/universityCreateAccount"; 
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

  const sessionUniversityId = session.user.id;
  if (session.user.role === "university" && !sessionUniversityId) {
    console.error(
      "API: University session found but university_id is missing for POST request."
    );
    return NextResponse.json(
      {
        message:
          "University ID not found in your session. Please log in again.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    await studentSchema.validate(body, { abortEarly: false });

    const {
      name,
      email,
      password,
      role,
      university_id, 
      batch_year,
      major,
      skills,
      facebook,
      linkedIn,
    } = body;

  
    if (
      session.user.role === "university" &&
      sessionUniversityId !== university_id
    ) {
      console.warn(
        `API: University ${sessionUniversityId} attempted to create student for university ${university_id}. Unauthorized.`
      );
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
        skills: skills || null, 
        facebook: facebook || null,
        linkedIn: linkedIn || null,
        // Github: github || null,
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
    console.warn(
      "API: Unauthorized GET attempt to /api/university/student - No session."
    );
    return NextResponse.json(
      { message: "You are not authenticated." },
      { status: 401 }
    );
  }

  if (session.user.role !== "university" && session.user.role !== "admin") {
    console.warn(
      `API: Unauthorized GET attempt to /api/university/student - Role: ${session.user.role}.`
    );
    return NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  const sessionUniversityId = session.user.id;
  if (session.user.role === "university" && !sessionUniversityId) {
    console.error(
      "API: University session found but university_id is missing for GET request."
    );
    return NextResponse.json(
      { message: "University ID not found in session." },
      { status: 403 }
    );
  }

  try {
    const whereClause = {
      role: "student",
    };

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

    console.log(
      `API: Fetched ${students.length} students for university ID: ${
        sessionUniversityId || "All (Admin)"
      }.`
    );
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
