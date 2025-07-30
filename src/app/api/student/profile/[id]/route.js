import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const student = await prisma.student.findUnique({
      where: { user_id : parseInt(id) },
      include: {
        university: true,
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.log("Error" , error)
    return NextResponse.json(

      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
