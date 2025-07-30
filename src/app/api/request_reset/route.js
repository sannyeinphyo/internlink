import { NextResponse } from "next/server";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: { otp, otpExpiry },
      create: { userId: user.id, otp, otpExpiry },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Code for Internlink password reset",
      text: `Your OTP code is ${otp}. It will expires in 10 minutes.`,
    });

    return NextResponse.json(
      { message: "OTP sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/request_reset:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
