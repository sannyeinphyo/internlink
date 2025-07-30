import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
   const resolvedParams = await params;  
  const id = parseInt(resolvedParams.id);

  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
