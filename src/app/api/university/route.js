import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); 

    const {
      name,
      email,
      password,
      role,
      image,
      status,
      address,
      contact_info,
      website,
    } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        image: image || null,
          status: status || "pending",
      },
    });

    if (body.role === "university") {
      await prisma.university.create({
        data: {
          user_id: user.id,
          name,
          address,
          contact_info,
          website: website || null,
        },
      });
    }

    return NextResponse.json({
      message: "Successfully created university",
      user,
    });
  } catch (error) {
    console.error("Error Creating Uni:", error);
    return NextResponse.json(
      {
        message: "Error Creating Uni",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      select: { id: true, name: true },
    });
    return new Response(JSON.stringify({ universities }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch universities" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}