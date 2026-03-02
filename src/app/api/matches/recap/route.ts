import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { generateMatchRecap } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { matchId } = await req.json();

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        events: {
          include: {
            player: { select: { name: true } },
          },
          orderBy: { minute: "asc" },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const recap = await generateMatchRecap({
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      events: match.events.map((e: typeof match.events[0]) => ({
        type: e.type as string,
        minute: e.minute || 0,
        playerName: e.player.name,
        relatedPlayerName: undefined,
      })),
    });

    await prisma.match.update({
      where: { id: matchId },
      data: { recap },
    });

    return NextResponse.json({ recap });
  } catch (error) {
    console.error("Error generating recap:", error);
    return NextResponse.json({ error: "Failed to generate recap" }, { status: 500 });
  }
}
