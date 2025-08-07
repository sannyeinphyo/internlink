import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const companyId = parseInt(params.id, 10);
    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required" }, { status: 400 });
    }

const company = await prisma.company.findUnique({
  where: { id: companyId },
  select: {
    id: true,
    name: true,
    image: true,
    website: true,
    facebook: true,
    description: true,
    location: true,
    contact_info: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        verified: true,
      },
    },
    _count: {
      select: {
        posts: true,
      },
    },
    posts: {
      select: {
        id: true,
        title: true,
        createdAt: true,
        location: true,
        paid: true,
        salary: true,
        job_type: true,
        remote: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  },
});




    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
