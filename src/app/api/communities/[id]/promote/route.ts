import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * PUT /api/communities/[id]/promote
 *
 * Promote or demote a member's role within a community.
 * Only COMMUNITY_MOD (or SUPER_ADMIN) can do this.
 *
 * Body: { userId: string, role: "VIEWER" | "ADMIN" | "COMMUNITY_MOD" }
 *
 * Rules:
 *  - COMMUNITY_MOD can promote members to ADMIN or demote ADMIN to VIEWER
 *  - COMMUNITY_MOD cannot promote to COMMUNITY_MOD (only SUPER_ADMIN can)
 *  - Cannot change own role
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: communityId } = await params;

    // Must be community mod
    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD");
    if (roleCheck) return roleCheck;

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    // Validate role values allowed in community context
    const validRoles = ["VIEWER", "ADMIN", "COMMUNITY_MOD"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be VIEWER, ADMIN, or COMMUNITY_MOD" }, { status: 400 });
    }

    // Only SUPER_ADMIN can promote to COMMUNITY_MOD
    if (role === "COMMUNITY_MOD" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can promote members to COMMUNITY_MOD" },
        { status: 403 }
      );
    }

    // Cannot change own role
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    // Find the target member
    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
    });

    if (!member) {
      return NextResponse.json({ error: "User is not a member of this community" }, { status: 404 });
    }

    // Cannot modify another COMMUNITY_MOD unless you're SUPER_ADMIN
    if (member.role === "COMMUNITY_MOD" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot modify another community moderator" },
        { status: 403 }
      );
    }

    const updated = await prisma.communityMember.update({
      where: { userId_communityId: { userId, communityId } },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
