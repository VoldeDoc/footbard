import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireRole } from "@/lib/session";

/**
 * GET /api/super-admin/communities
 *
 * List ALL communities (including suspended) for super admin.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const roleCheck = requireRole(user, "SUPER_ADMIN");
    if (roleCheck) return roleCheck;

    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            teams: true,
            leagues: true,
            announcements: true,
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
