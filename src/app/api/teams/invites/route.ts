import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole, isBannedFromCommunity } from "@/lib/session";

/**
 * GET /api/teams/invites — Get invites
 *   ?teamId=xxx  → invites sent by a team (mod view)
 *   ?userId=xxx  → invites received by a user (player view)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    const invites = await prisma.teamInvite.findMany({
      where: {
        ...(teamId ? { fromTeamId: teamId } : { toUserId: user.id }),
      },
      include: {
        fromTeam: { select: { id: true, name: true, logo: true, communityId: true } },
        toUser: { select: { id: true, name: true, email: true, image: true } },
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/teams/invites — Community mod invites a player to their team
 * Body: { teamId, targetUserId, message? }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { teamId, targetUserId, message } = await req.json();

    if (!teamId || !targetUserId) {
      return NextResponse.json({ error: "teamId and targetUserId are required" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { communityId: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check caller is mod/admin of the community
    const roleCheck = await requireCommunityRole(user, team.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    // Check target user isn't banned
    const banned = await isBannedFromCommunity(targetUserId, team.communityId);
    if (banned) {
      return NextResponse.json({ error: "This user is banned from the community" }, { status: 400 });
    }

    // Check for existing pending invite
    const existing = await prisma.teamInvite.findFirst({
      where: { teamId, targetUserId, status: "PENDING" },
    });
    if (existing) {
      return NextResponse.json({ error: "Invite already pending for this user" }, { status: 400 });
    }

    const invite = await prisma.teamInvite.create({
      data: { fromTeamId: teamId, toUserId: targetUserId, senderId: user.id, message },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/teams/invites — Player accepts/rejects an invite
 * Body: { inviteId, action: "ACCEPTED" | "REJECTED" }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { inviteId, action } = await req.json();

    if (!inviteId || !["ACCEPTED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "inviteId and action (ACCEPTED/REJECTED) required" }, { status: 400 });
    }

    const invite = await prisma.teamInvite.findUnique({ where: { id: inviteId } });
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    if (invite.toUserId !== user.id) {
      return NextResponse.json({ error: "Not your invite" }, { status: 403 });
    }
    if (invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invite already processed" }, { status: 400 });
    }

    const updated = await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: action },
    });

    // If accepted, add player to team
    if (action === "ACCEPTED") {
      const existingPlayer = await prisma.player.findFirst({
        where: { teamId: invite.fromTeamId },
      });
      if (!existingPlayer) {
        await prisma.player.create({
          data: {
            name: user.name,
            teamId: invite.fromTeamId,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error processing invite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
