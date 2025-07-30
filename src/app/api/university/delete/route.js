import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "university") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  try {
    await prisma.university.delete({
      where: { user_id: session.user.id },
    });

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ message: "University account deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting university account", error: error.message },
      { status: 500 }
    );
  }
}
