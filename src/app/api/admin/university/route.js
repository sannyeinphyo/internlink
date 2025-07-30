// api/admin/university/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as yup from "yup";
import { universitySchema } from "@/schemas/adminAccountCreation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const university = await prisma.user.findMany({
      where: {
        role: "university",
      },
      include: {
        university: true,
      },
    });

    return NextResponse.json({
      message: "Getting all university users...",
      data: university,
    });
  } catch (error) {
    console.error("Error fetching university users:", error); // Added console.error for better debugging
    return NextResponse.json(
      {
        message: "Error fetching university users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 } // Added status 500 for consistency in error responses
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const body = await req.json();
    // Validate the request body specifically for university creation
    await universitySchema.validate(body, { abortEarly: false });
    const {
      name,
      email,
      password,
      role,
      status, // This 'status' will be from the request body, if provided
      address,
      contact_info,
      website,
    } = body;

    // Check if user with email already exists
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
        // *** CHANGE MADE HERE: Default status is now "approved" ***
        status: status || "approved", // Set default status to "approved" if not explicitly provided or is falsy
        verified: true,
      },
    });

    // This 'if' condition is redundant here because universitySchema validation should ensure role is 'university'
    // for this specific route. However, keeping it doesn't harm.
    if (body.role === "university") {
      await prisma.university.create({
        data: {
          user_id: user.id,
          name, // Use the name from the request body for university name
          address,
          contact_info,
          website: website || null,
        },
      });
    }

    return NextResponse.json({
      message: "Successfully created university",
      user_id: user.id, // Returning user.id is usually more practical than the whole user object
    });
  } catch (error) {
    console.error("Error Creating Uni:", error);
    // *** Added yup validation error handling for consistency ***
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
