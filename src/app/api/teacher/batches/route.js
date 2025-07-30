import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const batches = await prisma.student.findMany({
      select: { batch_year: true },
      distinct: ["batch_year"],
      orderBy: { batch_year: "desc" },
    });

    const batchList = batches.map((b) => b.batch_year).filter(Boolean);

    return NextResponse.json(batchList);
  } catch (error) {
    console.error("Failed to fetch batch years:", error);
    return new NextResponse("Failed to load batches", { status: 500 });
  }
}
