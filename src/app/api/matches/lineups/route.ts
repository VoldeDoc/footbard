import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (isDemoUser(user.email)) return NextResponse.json({ success: true, demo: true });

    const { matchId, lineups } = await req.json();

    if (!matchId || !lineups?.length) {
      return NextResponse.json({ error: "Match ID and lineups are required" }, { status: 400 });
    }

    // Delete existing lineups for this match
    await prisma.matchLineup.deleteMany({ where: { matchId } });

    // Create new lineups
    await prisma.matchLineup.createMany({
      data: lineups.map((l: any) => ({
        matchId,
        teamId: l.teamId,
        playerId: l.playerId,
        positionX: l.positionX,
        positionY: l.positionY,
        isStarter: l.isStarter ?? true,
        minutesPlayed: l.minutesPlayed ?? 0,
        rating: l.rating ?? 0,
      })),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving lineups:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
