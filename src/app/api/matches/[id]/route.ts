import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        league: { select: { id: true, name: true, season: true, communityId: true } },
        lineups: {
          include: {
            player: { select: { id: true, name: true, image: true, position: true, jerseyNumber: true } },
          },
          orderBy: { isStarter: "desc" },
        },
        events: {
          include: {
            player: { select: { id: true, name: true, jerseyNumber: true } },
            relatedPlayer: { select: { id: true, name: true, jerseyNumber: true } },
          },
          orderBy: { minute: "asc" },
        },
        mvpVotes: {
          include: {
            player: { select: { id: true, name: true, image: true } },
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
