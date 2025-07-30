import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // adjust to your prisma path
import bcrypt from "bcryptjs";
export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }


    const resetRecord = await prisma.passwordReset.findUnique({
      where: { userId: user.id },
    });

    if (
      !resetRecord ||
      resetRecord.otp !== otp ||
      resetRecord.otpExpiry < new Date()
    ) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    await prisma.passwordReset.delete({ where: { userId: user.id } });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 },
      
    );
  } catch (error) {
    console.error("Error in /api/reset-password:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
