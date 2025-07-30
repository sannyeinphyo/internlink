"use server";

import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import InternshipReportPdf from "@/components/InternshipReportPdf";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Font } from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "Myanmar",
  src: path.join(process.cwd(), "public", "fonts", "NotoSansMyanmar-Regular.ttf"),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== "university") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { batch_year, status, department } = await req.json();

    const university = await prisma.university.findUnique({
      where: { user_id: user.id },
    });

    if (!university) {
      return NextResponse.json({ message: "University profile not found" }, { status: 404 });
    }

    const universityId = university.id;
    const universityName = university.name;

    const applications = await prisma.internshipApplication.findMany({
      where: {
        ...(status ? { status } : {}),
        student: {
          ...(batch_year ? { batch_year } : {}),
          ...(department ? { major: department } : {}),
          university_id: universityId,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        post: {
          include: {
            company: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const reportData = applications.map((app) => ({
      studentName: app.student.user.name,
      companyName: app.post?.company?.user?.name || "-",
      status: app.status,
    }));

    const document = (
      <InternshipReportPdf
        reportData={reportData}
        university={universityName}
        batch_year={batch_year || "All Batches"}
      />
    );

    const pdfBuffer = await pdf(document).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=internship_report.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to generate report", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
