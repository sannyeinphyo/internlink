import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendApprovedApprovedEmail } from "@/lib/sendApprovedEmail";
import { sendRejectingApprovalEmail } from "@/lib/sendRejectEmail";
export async function GET(request, { params }) {
  const userId = parseInt(params.id);

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID format." },
      { status: 400 }
    );
  }
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        company: true,
        student: {
          include: {
            university: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  } 
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Your Not Authorized" });
  }
  const userId = params.id;
  const { status } = await request.json(); 

  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) {
    return NextResponse.json(
      { error: "Invalid user ID format." },
      { status: 400 }
    );
  }

  const validStatuses = ["approved", "declined"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status provided. Must be 'approved' or 'declined'." },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parsedUserId, 
      },
      data: {
        status: status, 
        verified: status === "approved" ? true : false,
      },
    });

    if(status === "approved") {
      if (updatedUser.role === "company") {
        await sendApprovedApprovedEmail(updatedUser.email, updatedUser.name);
      } else if (updatedUser.role === "student") {
        await sendApprovedApprovedEmail(updatedUser.email, updatedUser.name);
      }
    }

    if(status === "declined") {
      if (updatedUser.role === "company") {
        await sendRejectingApprovalEmail(updatedUser.email, updatedUser.name);
      } else if (updatedUser.role === "student") {
        await sendRejectingApprovalEmail(updatedUser.email, updatedUser.name);
      }
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(
      `Failed to update user ${userId} status to ${status}:`,
      error
    );

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "User not found for update." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "An internal server error occurred during status update." },
      { status: 500 }
    );
  } 
}
