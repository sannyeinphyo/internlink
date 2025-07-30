import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {
    const id = session.user.id;

    const admin = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({ message: "Getting admin", admin });
  } catch (error) {
    return NextResponse.json(
      { message: "Error Getting Admin", error: error.message },
      { status: 500 }
    );
  }
}
export async function PUT(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {
    const id = session.user.id;
    const { name, email, image } = await req.json();

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({ message: "Admin updated", admin: updatedAdmin });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating admin", error: error.message },
      { status: 500 }
    );
  }
}
