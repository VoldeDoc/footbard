import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } },
          orderBy: { joinedAt: "asc" },
        },
        teams: {
          include: { _count: { select: { players: true } } },
        },
        leagues: {
          include: { _count: { select: { matches: true, leagueTeams: true } } },
        },
        _count: { select: { members: true, teams: true, leagues: true, announcements: true } },
      },
    });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const roleCheck = await requireCommunityRole(user, id, "COMMUNITY_MOD");
    if (roleCheck) return roleCheck;

    const { name, description, logo, banner } = await req.json();

    const community = await prisma.community.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
        ...(banner !== undefined && { banner }),
      },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Only SUPER_ADMIN can delete communities
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only platform admins can delete communities" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.community.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
