import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * GET /api/leagues — List leagues (optionally by communityId)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const leagues = await prisma.league.findMany({
      where: communityId ? { communityId } : undefined,
      include: {
        community: { select: { id: true, name: true, logo: true } },
        _count: { select: { matches: true, leagueTeams: true } },
        leagueTeams: {
          include: { team: { select: { id: true, name: true, logo: true, shortName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/leagues — Community mod creates a league
 * Body: { name, season, communityId }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { name, season, communityId } = await req.json();

    if (!name || !season || !communityId) {
      return NextResponse.json({ error: "name, season, and communityId are required" }, { status: 400 });
    }

    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD");
    if (roleCheck) return roleCheck;

    const league = await prisma.league.create({
      data: { name, season, communityId },
      include: {
        community: { select: { id: true, name: true } },
        _count: { select: { matches: true, leagueTeams: true } },
      },
    });

    return NextResponse.json(league, { status: 201 });
  } catch (error) {
    console.error("Error creating league:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
