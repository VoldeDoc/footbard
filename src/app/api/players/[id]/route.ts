import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { isDemoUser, DEMO_PLAYERS } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    if (isDemoUser(user.email)) {
      const player = DEMO_PLAYERS.find((p) => p.id === id);
      if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });
      return NextResponse.json({ ...player, averageRating: 7.2 });
    }

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: { select: { id: true, name: true, logo: true } },
        lineups: {
          include: {
            match: {
              include: {
                homeTeam: { select: { name: true, logo: true } },
                awayTeam: { select: { name: true, logo: true } },
              },
            },
          },
          orderBy: { match: { matchDate: "desc" } },
        },
        events: {
          include: {
            match: {
              select: {
                id: true,
                matchDate: true,
                homeTeam: { select: { name: true } },
                awayTeam: { select: { name: true } },
              },
            },
          },
          orderBy: { match: { matchDate: "desc" } },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
