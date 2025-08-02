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

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" }, 
        { status: 401 }
      );
    }

    if (user.role !== "university" && user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized role" }, 
        { status: 403 }
      );
    }

    const { batch_year, status, university_id } = await req.json();

    const accept = req.headers.get('accept') || '';
    const wantsPDF = accept.includes('application/pdf');

    let universityIdToFilter = undefined;
    let universityName = "All Universities";

    if (user.role === "university") {
      const university = await prisma.university.findUnique({
        where: { user_id: user.id },
      });

      if (!university) {
        return NextResponse.json(
          { message: "University profile not found" },
          { status: 404 }
        );
      }

      universityIdToFilter = university.id;
      universityName = university.name;
    } 
    // Handle admin users
    else if (university_id) {
      const university = await prisma.university.findUnique({ 
        where: { id: university_id } 
      });
      
      if (!university) {
        return NextResponse.json(
          { message: "Specified university not found" },
          { status: 404 }
        );
      }
      
      universityIdToFilter = university.id;
      universityName = university.name;
    }

    // Fetch applications with proper type conversion
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


    if (wantsPDF) {
      const pdfDocument = (
        <InternshipReportPdf
          reportData={reportData}
          university={universityName}
          batch={batch_year ? `Batch ${batch_year}` : "All Batches"}
        />
      );

      const pdfBuffer = await pdf(pdfDocument).toBuffer();

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=internship_report.pdf",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      university: universityName,
      batch: batch_year || null,
      count: applications.length,
    });

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { 
        message: "Failed to generate report", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}