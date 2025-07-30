import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "university") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {
    const university = await prisma.university.findUnique({
      where: { user_id: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "Getting university", university });
  } catch (error) {
    return NextResponse.json(
      { message: "Error Getting University", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "university") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {
    const { name, image, contact_info, address, website } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name , image },
    });

    const updatedUniversity = await prisma.university.update({
      where: { user_id: session.user.id },
      data: {  contact_info, address, website },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ message: "University updated", university: updatedUniversity });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating university", error: error.message },
      { status: 500 }
    );
  }
}
