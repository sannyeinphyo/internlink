import { prisma } from "@/lib/prisma";
import {NextResponse} from "next/server"
export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    const post = await prisma.internshipPost.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    return NextResponse.json({
      message: "Getting internship detail...",
      data: post,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error getting internship detail",
      error: error.message,
    });
  }
}
