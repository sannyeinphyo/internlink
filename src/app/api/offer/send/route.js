// /app/api/offer/send/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path as needed
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  const token = await getToken({ req });
  if (!token || token.role !== "company") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { universityId, message } = body;

  try {
    const offer = await prisma.companyOffer.create({
      data: {
        companyId: token.company.id,
        universityId,
        message,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send offer" }, { status: 500 });
  }
}
