import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function DELETE(_, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.internshipApplication.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
