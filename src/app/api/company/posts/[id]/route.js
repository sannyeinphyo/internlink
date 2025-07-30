import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const postId = parseInt(params.id);

  if (isNaN(postId)) {
    return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const post = await prisma.internshipPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.company_id !== company.id) {
      return NextResponse.json(
        { message: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.internshipPost.delete({
      where: { id: postId },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { user_id: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const post = await prisma.internshipPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.company_id !== company.id) {
      return NextResponse.json(
        { message: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    const data = await request.json();

    const allowedFields = [
      "title",
      "description",
      "requirements",
      "paid",
      "salary",
      "location",
      "start_date",
      "end_date",
      "job_type",
      "application_deadline",
      "benefits",
      "contact_email",
      "remote",
      "positions",
      "responsibilities",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (
          ["start_date", "end_date", "application_deadline"].includes(field) &&
          data[field]
        ) {
          updateData[field] = new Date(data[field]);
        } else if (field === "salary" && data[field] !== null) {
          updateData[field] = Number(data[field]); 
        } else {
          updateData[field] = data[field];
        }
      }
    }

    const updatedPost = await prisma.internshipPost.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
