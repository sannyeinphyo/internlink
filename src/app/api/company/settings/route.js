import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

  return NextResponse.json(company);
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const updated = await prisma.company.update({
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

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

