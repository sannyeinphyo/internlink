import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { user_id, title, body } = await request.json();

  try {
    const notification = await prisma.notification.create({
      data: {
        user_id,
        title,
        body,
      },
    });


    await pusherServer.trigger(
      `user-${user_id}`,              
      "new-notification",             
      notification                   
    );

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
