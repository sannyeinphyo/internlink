import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req, { params }) {
  try {
    const id = params.id;
    const company = await prisma.company.findMany({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}