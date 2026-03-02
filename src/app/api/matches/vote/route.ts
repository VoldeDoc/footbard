import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (isDemoUser(user.email)) return NextResponse.json({ success: true, demo: true });

    const { matchId, playerId } = await req.json();

    if (!matchId || !playerId) {
      return NextResponse.json({ error: "Match and player are required" }, { status: 400 });
    }

    const vote = await prisma.mvpVote.upsert({
      where: {
        matchId_voterId: { matchId, voterId: user.id },
      },
      create: {
        matchId,
        playerId,
        voterId: user.id,
      },
      update: {
        playerId,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
