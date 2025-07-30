import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { user_id: session.user.id },
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({ data: company });
}
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  try {
    const updatedCompany = await prisma.company.update({
      where: { user_id: session.user.id },
      data: {
        name: body.name,
        website: body.website,
        description: body.description,
        location: body.location,
        contact_info: body.contact_info,
        facebook: body.facebook,
        image: body.image,
      },
    });

    return NextResponse.json({ data: updatedCompany });
  } catch (error) {
    console.error("Failed to update company:", error);
    return NextResponse.json(
      { message: "Failed to update company" },
      { status: 500 }
    );
  }
}
