import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req) {
  const body = await prisma.user.findMany();
  return NextResponse.json({ message: "This is message", body });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        password: hashedPassword,
        role: body.role,
        status: body.status || "pending",
      },
    });

    if (body.role === "company") {
      console.log("Creating company ....");
      await prisma.company.create({
        data: {
          user_id: user.id,
          name: body.companyName || user.name,
          location: body.location || "",
          contact_info: body.contact_info || "",
          image: body.image || null,
          website: body.website || null,
          facebook: body.facebook || null,
          description: body.description || null,
        },
      });
    }

    return NextResponse.json({
      message: "Update Successful",
      user,
    });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
