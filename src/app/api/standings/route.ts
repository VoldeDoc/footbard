import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isDemoUser, DEMO_STANDINGS } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (isDemoUser(user.email)) return NextResponse.json(DEMO_STANDINGS);

    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get("leagueId");

    if (!leagueId) {
      return NextResponse.json({ error: "leagueId is required" }, { status: 400 });
    }

    const standings = await prisma.standing.findMany({
      where: { leagueId },
      include: {
        team: { select: { id: true, name: true, shortName: true, logo: true } },
      },
      orderBy: [
        { points: "desc" },
        { goalDifference: "desc" },
        { goalsFor: "desc" },
      ],
    });

    return NextResponse.json(standings);
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
