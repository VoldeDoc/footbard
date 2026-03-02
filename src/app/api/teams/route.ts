import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const teams = await prisma.team.findMany({
      where: communityId ? { communityId } : undefined,
      include: {
        _count: { select: { players: true } },
        community: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { name, shortName, logo, communityId, formation } = await req.json();

    if (!name || !communityId) {
      return NextResponse.json({ error: "Name and community are required" }, { status: 400 });
    }

    // Only COMMUNITY_MOD/ADMIN of that community (or SUPER_ADMIN) can create teams
    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const team = await prisma.team.create({
      data: { name, shortName, logo, communityId, formation },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
