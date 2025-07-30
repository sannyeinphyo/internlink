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

    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { batch_year, status, university_id, department } = await req.json();

    let universityIdToFilter = undefined;
    let departmentToFilter = undefined;
    let universityName = "All Universities";

    if (user.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { user_id: user.id },
        include: { university: true },
      });

      if (!teacher) {
        return NextResponse.json({ message: "Teacher profile not found" }, { status: 403 });
      }

      universityIdToFilter = teacher.university_id;
      departmentToFilter = teacher.department;
      universityName = teacher.university.name;
    }

    if (user.role === "admin" && university_id) {
      const uni = await prisma.university.findUnique({ where: { id: university_id } });
      if (uni) {
        universityIdToFilter = uni.id;
        universityName = uni.name;
        if (department) {
          departmentToFilter = department;
        }
      }
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        ...(status ? { status } : {}),
        student: {
          ...(batch_year ? { batch_year } : {}),
          ...(universityIdToFilter ? { university_id: universityIdToFilter } : {}),
          ...(departmentToFilter ? { major: departmentToFilter } : {}),
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
