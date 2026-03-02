import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";
import { recalcPlayerStats } from "@/lib/player-stats";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { matchId, type, minute, playerId, relatedPlayerId, description: _description } = await req.json();

    if (!matchId || !type || minute === undefined || !playerId) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    // Lookup match → league → community for RBAC
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { league: { select: { communityId: true } } },
    });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const roleCheck = await requireCommunityRole(user, match.league.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    // Validate player exists
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (relatedPlayerId) {
      const relatedPlayer = await prisma.player.findUnique({ where: { id: relatedPlayerId } });
      if (!relatedPlayer) {
        return NextResponse.json({ error: "Related player not found" }, { status: 404 });
      }
    }

    const event = await prisma.matchEvent.create({
      data: { matchId, type, minute, playerId, relatedPlayerId /* description field not in schema */ },
    });

    // Recalculate stats for involved players from all their events
    await recalcPlayerStats(playerId);
    if (relatedPlayerId) {
      await recalcPlayerStats(relatedPlayerId);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating match event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
