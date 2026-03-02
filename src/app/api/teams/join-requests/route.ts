import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, isBannedFromCommunity } from "@/lib/session";

/**
 * GET /api/teams/join-requests — Get join requests
 *   ?teamId=xxx  → requests for a specific team (mod view)
 *   ?userId=xxx  → requests by a specific user (player view)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const userId = searchParams.get("userId");

    const requests = await prisma.teamJoinRequest.findMany({
      where: {
        ...(teamId && { teamId }),
        ...(userId && { userId }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        team: { select: { id: true, name: true, logo: true, communityId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/teams/join-requests — Player requests to join a team
 * Body: { teamId, message? }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { teamId, message } = await req.json();

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { communityId: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if banned from community
    const banned = await isBannedFromCommunity(user.id, team.communityId);
    if (banned) {
      return NextResponse.json({ error: "You are banned from this community" }, { status: 403 });
    }

    // Check for existing pending request
    const existing = await prisma.teamJoinRequest.findFirst({
      where: { userId: user.id, teamId, status: "PENDING" },
    });
    if (existing) {
      return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });
    }

    const request = await prisma.teamJoinRequest.create({
      data: { userId: user.id, playerId: user.id, teamId, message },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Error creating join request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/teams/join-requests — Mod accepts/rejects a join request
 * Body: { requestId, action: "ACCEPTED" | "REJECTED" }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { requestId, action } = await req.json();

    if (!requestId || !["ACCEPTED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "requestId and action (ACCEPTED/REJECTED) required" }, { status: 400 });
    }

    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: { team: { select: { communityId: true } } },
    });
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (request.status !== "PENDING") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    // Verify caller is COMMUNITY_MOD of the team's community
    if (user.role !== "SUPER_ADMIN") {
      const member = await prisma.communityMember.findUnique({
        where: { userId_communityId: { userId: user.id, communityId: request.team.communityId } },
      });
      if (!member || !["COMMUNITY_MOD", "ADMIN"].includes(member.role)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
    }

    const updated = await prisma.teamJoinRequest.update({
      where: { id: requestId },
      data: { status: action },
    });

    // If accepted, add player to the team
    if (action === "ACCEPTED") {
      // Create player profile if needed
      const existingPlayer = await prisma.player.findFirst({
        where: { userId: request.userId, teamId: request.teamId },
      });
      if (!existingPlayer) {
        const reqUser = await prisma.user.findUnique({
          where: { id: request.userId },
          select: { name: true, image: true },
        });
        await prisma.player.create({
          data: {
            name: reqUser?.name || "Unknown Player",
            image: reqUser?.image,
            teamId: request.teamId,
            userId: request.userId,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error processing join request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
