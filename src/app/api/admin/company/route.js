// src/app/api/admin/company/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as yup from "yup";
import { companySchema } from "@/schemas/adminAccountCreation"; // Assuming companySchema is part of combinedAccountSchema in the client

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const companyUsers = await prisma.user.findMany({
      where: {
        role: "company",
      },
      include: {
        company: true, // Include company details if they exist
      },
    });

    return NextResponse.json({
      message: "Getting all company users...",
      data: companyUsers,
    });
  } catch (error) {
    console.error("Error fetching company users:", error);
    return NextResponse.json(
      {
        message: "Error fetching company users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST request for creating a new company user
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const body = await req.json();
    await companySchema.validate(body, { abortEarly: false });

    const {
      name,
      email,
      password,
      role,
      status, // This 'status' will be from the request body, if provided
      location,
      contact_info,
      description,
      website,
      facebook,
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
        role, // Should be 'company'
        // Set default status to "approved" if not explicitly provided or is falsy
        status: status || "approved",
        verified: true,
      },
    });

    // Create company record associated with the user
    await prisma.company.create({
      data: {
        user_id: user.id,
        name: name, // Use the name from the request body for company name
        location: location,
        contact_info: contact_info,
        description: description,
        website: website || null,
        facebook: facebook || null,
      },
    });

    return NextResponse.json({
      message: "Successfully created company account",
      user_id: user.id,
    });
  } catch (error) {
    console.error("Error Creating Company Account:", error);
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
