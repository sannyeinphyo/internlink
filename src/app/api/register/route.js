import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/schemas/validationSchemas";
import { sendOtpToEmail } from "@/lib/sendOtpToEmail";
import otpGenerator from "otp-generator";

export async function POST(request) {
  try {
    const body = await request.json();
    await registerSchema.validate(body, { abortEarly: false });

    const {
      email,
      password,
      role,
      name,
      status = "pending",
      image = null,
      batch_year,
      major,
      skills,
      facebook,
      linkedIn,
      university_id,
      location,
      website,
      facebook_company,
      description,
      contact_info,
    } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.verified) {
      return NextResponse.json(
        { message: "User already exists and is verified." },
        { status: 409 }
      );
    }

    if (existingUser && !existingUser.verified) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

     const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        image,
        verified: false,
        otp,
        otpExpiresAt,
      },
    });

    if (role === "student") {
      await prisma.student.create({
        data: {
          user: { connect: { id: user.id } },
          batch_year,
          major,
          skills: Array.isArray(skills) ? skills.join(", ") : skills || null,
          facebook,
          linkedIn,
          university: { connect: { id: parseInt(university_id) } },
        },
      });
    }

    if (role === "company") {
      await prisma.company.create({
        data: {
          user_id: user.id,
          name,
          location,
          website: website || null,
          facebook: facebook_company || null,
          description: description || null,
          contact_info,
        },
      });
    }

    await sendOtpToEmail(email, otp);

    return NextResponse.json(
      { message: "User registered successfully. OTP sent to email." },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
