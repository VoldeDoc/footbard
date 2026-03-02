import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { matchId, playerId } = await req.json();

    if (!matchId || !playerId) {
      return NextResponse.json({ error: "Match and player are required" }, { status: 400 });
    }

    const vote = await prisma.mvpVote.upsert({
      where: {
        matchId_userId: { matchId, userId: user.id },
      },
      create: {
        matchId,
        playerId,
        userId: user.id,
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
