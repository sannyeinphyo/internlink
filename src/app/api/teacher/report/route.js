import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import InternshipReportPdf from "@/components/InternshipReportPdf";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { Font } from "@react-pdf/renderer";

const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansMyanmar-Regular.ttf");

const fontBuffer = fs.readFileSync(fontPath);
Font.register({
  family: "Myanmar",
  src: fontBuffer,
  format: "truetype"
});
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { batch_year, status } = await req.json();

    let universityIdToFilter = undefined;
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
      universityName = teacher.university.name;
    }

    if (user.role === "admin" && university_id) {
      const uni = await prisma.university.findUnique({ where: { id: university_id } });
      if (uni) {
        universityIdToFilter = uni.id;
        universityName = uni.name;
      }
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        ...(status ? { status } : {}),
        student: {
          ...(batch_year ? { batch_year: parseInt(batch_year) } : {}),
          ...(universityIdToFilter ? { university_id: universityIdToFilter } : {}),
        },
      },
      include: {
        student: {
          include: { user: true },
        },
        post: {
          include: {
            company: {
              include: { user: true },
            },
          },
        },
      },
    });

    const reportData = applications.map((app) => ({
      studentName: app.student.user.name,
      companyName: app.post?.company?.user?.name || "-",
      status: app.status,
      batchYear: app.student.batch_year,
    }));

    return NextResponse.json({
      success: true,
      data: reportData,
      university: universityName,
      batch: batch_year || null,
      count: applications.length
    });

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { message: "Failed to generate report", error: error.message },
      { status: 500 }
    );
  }
}