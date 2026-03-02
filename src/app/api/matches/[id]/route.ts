import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { isDemoUser, DEMO_MATCHES } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    if (isDemoUser(user.email)) {
      const match = DEMO_MATCHES.find((m) => m.id === id);
      if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
      const plain = { ...match, events: match.events, lineups: match.lineups };
      return NextResponse.json(plain);
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        league: { select: { id: true, name: true, season: true, communityId: true } },
        lineups: {
          include: {
            player: { select: { id: true, name: true, position: true, shirtNumber: true } },
          },
          orderBy: { isStarter: "desc" },
        },
        events: {
          include: {
            player: { select: { id: true, name: true, shirtNumber: true } },
            relatedPlayer: { select: { id: true, name: true, shirtNumber: true } },
          },
          orderBy: { minute: "asc" },
        },
        mvpVotes: {
          include: {
            player: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
