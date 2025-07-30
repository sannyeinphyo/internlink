import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  const { id } = await request.json();

  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
