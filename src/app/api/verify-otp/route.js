import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendPendingApprovalEmail } from "@/lib/sendPendingApprovalEmail";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json(
        { message: "User is already verified" },
        { status: 400 }
      );
    }

    if (
      user.otp !== otp ||
      !user.otpExpiresAt ||
      new Date(user.otpExpiresAt) < new Date()
    ) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        verified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    const { role, name } = user;

    if (["student", "company"].includes(role)) {
      await sendPendingApprovalEmail(email, name);
    }

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
