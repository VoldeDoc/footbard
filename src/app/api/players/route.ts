import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    const players = await prisma.player.findMany({
      where: {
        ...(teamId && { teamId }),
        isBanned: false,
      },
      include: { team: { select: { id: true, name: true, logo: true, communityId: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { name, position, jerseyNumber, teamId, image } = await req.json();

    if (!name || !teamId) {
      return NextResponse.json({ error: "Name and team are required" }, { status: 400 });
    }

    // Find team to check community role
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { communityId: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const roleCheck = await requireCommunityRole(user, team.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const player = await prisma.player.create({
      data: { name, position, shirtNumber: jerseyNumber ?? null, teamId },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
