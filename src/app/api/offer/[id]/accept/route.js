import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function PATCH(req, { params }) {
  const token = await getToken({ req });
  if (!token || token.role !== "university") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offerId = parseInt(params.id);

  try {
    const offer = await prisma.companyOffer.update({
      where: { id: offerId },
      data: { status: "ACCEPTED" },
      include: { company: { include: { user: true } }, university: true },
    });

    await prisma.notification.create({
      data: {
        user_id: offer.company.user_id,
        title: "Offer Accepted",
        body: `${offer.university.name} has accepted your offer.`,
      },
    });

    return NextResponse.json(offer, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to accept offer" }, { status: 500 });
  }
}
