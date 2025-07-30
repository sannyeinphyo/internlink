import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const companies = await prisma.partnerCompany.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json({data:companies});
  } catch (error) {
    return new Response("Failed to fetch partner companies", { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, logoPath } = body;

    if (!name || !logoPath) {
      return new Response("Missing name or logoPath", { status: 400 });
    }

    const newCompany = await prisma.partnerCompany.create({
      data: {
        name,
        logoPath,
      },
    });

    return Response.json(newCompany, { status: 201 });
  } catch (error) {
    console.error("Error creating partner company:", error);
    return new Response("Server error", { status: 500 });
  }
}
