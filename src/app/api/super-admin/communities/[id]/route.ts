import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireRole } from "@/lib/session";

/**
 * PUT /api/super-admin/communities/[id]
 *
 * Suspend or unsuspend a community. Super admin only.
 * Body: { isSuspended: boolean }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const roleCheck = requireRole(user, "SUPER_ADMIN");
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const { isSuspended } = await req.json();

    if (typeof isSuspended !== "boolean") {
      return NextResponse.json({ error: "isSuspended must be a boolean" }, { status: 400 });
    }

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const updated = await prisma.community.update({
      where: { id },
      data: { isSuspended },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/super-admin/communities/[id]
 *
 * Permanently delete a community and all related data. Super admin only.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const roleCheck = requireRole(user, "SUPER_ADMIN");
    if (roleCheck) return roleCheck;

    const { id } = await params;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Cascading delete handled by Prisma schema onDelete: Cascade
    await prisma.community.delete({ where: { id } });

    return NextResponse.json({ message: "Community deleted" });
  } catch (error) {
    console.error("Error deleting community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
