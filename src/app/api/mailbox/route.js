import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message, user_id } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

 const mailboxEntry = await prisma.mailbox.create({
  data: {
    name,
    email,
    message,
    user: user_id ? { connect: { id: user_id } } : undefined,
  },
});


    return NextResponse.json(mailboxEntry, { status: 201 });
  } catch (error) {
    console.error("Mailbox POST Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await prisma.mailbox.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Mailbox GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages." },
      { status: 500 }
    );
  }
}
