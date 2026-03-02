import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");
    const mine = searchParams.get("mine");

    let whereClause: any = {};

    if (mine === "true") {
      // Only teams from communities where user is a mod/admin/creator
      const memberships = await prisma.communityMember.findMany({
        where: { userId: user.id },
        select: { communityId: true },
      });
      const created = await prisma.community.findMany({
        where: { createdById: user.id },
        select: { id: true },
      });
      const allCommunityIds = [
        ...memberships.map((m) => m.communityId),
        ...created.map((c) => c.id),
      ];
      const uniqueIds = [...new Set(allCommunityIds)];
      whereClause = { communityId: { in: uniqueIds } };
    } else if (communityId) {
      whereClause = { communityId };
    }

    const teams = await prisma.team.findMany({
      where: whereClause,
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

    const { name, shortName, logo, communityId } = await req.json();

    if (!name || !communityId) {
      return NextResponse.json({ error: "Name and community are required" }, { status: 400 });
    }

    // Only COMMUNITY_MOD/ADMIN of that community (or SUPER_ADMIN) can create teams
    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const team = await prisma.team.create({
      data: { name, shortName, logo, communityId },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
