import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { generateMatchRecap } from "@/lib/gemini";
import { isDemoUser } from "@/lib/demo-data";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (isDemoUser(user.email)) return NextResponse.json({ recap: "This is a demo match recap. Thunder FC dominated the first half with two quick goals, while Lightning United fought back in the second half but couldn't find an equaliser. A fantastic match!" });

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
