import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";

function getExpiryDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

export async function POST(req) {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const otpExpiresAt = getExpiryDate();

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt },
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
      subject: "UniJobLink Email Verification OTP",
      text: `Your verification OTP code is ${otp}. It will expire in 10 minutes.`,
    });

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error in /api/resend-otp:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
