import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireRole } from "@/lib/session";

/**
 * PUT /api/super-admin/users/[id]
 *
 * Update user role or ban status. Super admin only.
 * Body: { role?: string, isBanned?: boolean }
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
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot modify yourself
    if (id === user.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    // Cannot modify another super admin
    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot modify another super admin" }, { status: 403 });
    }

    const data: any = {};

    if (body.role !== undefined) {
      const validRoles = ["USER", "COMMUNITY_MOD", "ADMIN", "SUPER_ADMIN"];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      data.role = body.role;
    }

    if (body.isBanned !== undefined) {
      if (typeof body.isBanned !== "boolean") {
        return NextResponse.json({ error: "isBanned must be a boolean" }, { status: 400 });
      }
      data.isBanned = body.isBanned;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
