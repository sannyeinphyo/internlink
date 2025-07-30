import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const notification = await prisma.notification.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        body: data.body,
        read: false,
      },
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
