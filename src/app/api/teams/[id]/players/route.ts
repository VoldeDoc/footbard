import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * DELETE /api/teams/[id]/players — Remove a player from team
 * Body: { playerId }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { communityId: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const roleCheck = await requireCommunityRole(user, team.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 });
    }

    await prisma.player.delete({ where: { id: playerId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
