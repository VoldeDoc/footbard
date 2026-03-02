import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * GET /api/communities/[id]/bans — List all bans for a community
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const roleCheck = await requireCommunityRole(user, id, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const bans = await prisma.communityBan.findMany({
      where: { communityId: id },
      orderBy: { bannedAt: "desc" },
    });

    // Get banned user details
    const userIds = bans.map((b) => b.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, image: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = bans.map((b) => ({
      ...b,
      user: userMap.get(b.userId) || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching bans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/communities/[id]/bans — Ban a user from a community
 * Body: { userId, reason? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: communityId } = await params;

    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD");
    if (roleCheck) return roleCheck;

    const { userId, reason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Can't ban yourself
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
    }

    // Create ban record
    const ban = await prisma.communityBan.upsert({
      where: { communityId_userId: { communityId, userId } },
      create: { communityId, userId, bannedById: user.id, reason },
      update: { reason, bannedAt: new Date() },
    });

    // Remove from community members
    await prisma.communityMember.deleteMany({
      where: { communityId, userId },
    });

    // Remove all player profiles from community teams
    const communityTeams = await prisma.team.findMany({
      where: { communityId },
      select: { id: true },
    });
    const teamIds = communityTeams.map((t) => t.id);

    await prisma.player.updateMany({
      where: { teamId: { in: teamIds }, userId },
      data: { isBanned: true },
    });

    // Cancel pending join requests
    await prisma.teamJoinRequest.updateMany({
      where: { userId, teamId: { in: teamIds }, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(ban, { status: 201 });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/communities/[id]/bans — Unban a user
 * Body: { userId }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: communityId } = await params;

    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD");
    if (roleCheck) return roleCheck;

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await prisma.communityBan.delete({
      where: { communityId_userId: { communityId, userId } },
    }).catch(() => null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
