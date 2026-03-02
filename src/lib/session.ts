import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.user?.email) return null;
  return session.user as SessionUser;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ─── ROLE MIDDLEWARE HELPERS ─────────────────────

/**
 * Require authenticated user. Returns user or null.
 */
export async function requireAuth(): Promise<SessionUser | null> {
  return getCurrentUser();
}

/**
 * Check if user has one of the allowed global roles.
 */
export function hasRole(user: SessionUser, ...roles: string[]): boolean {
  return roles.includes(user.role);
}

/**
 * Require user to have one of the specified global roles.
 * Returns a 403 response if check fails, or null if OK.
 */
export function requireRole(user: SessionUser, ...roles: string[]): NextResponse | null {
  if (!hasRole(user, ...roles)) {
    return NextResponse.json(
      { error: `Forbidden. Required role: ${roles.join(" or ")}` },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check user's role within a community via CommunityMember.
 * Returns the member record or null.
 */
export async function getCommunityMember(userId: string, communityId: string) {
  return prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });
}

/**
 * Require user to have one of the allowed roles in a community.
 * SUPER_ADMIN always passes.
 * Returns a 403 response if fails, or null if OK.
 */
export async function requireCommunityRole(
  user: SessionUser,
  communityId: string,
  ...roles: string[]
): Promise<NextResponse | null> {
  // SUPER_ADMIN can do anything
  if (user.role === "SUPER_ADMIN") return null;

  const member = await getCommunityMember(user.id, communityId);
  if (!member || !roles.includes(member.role)) {
    return NextResponse.json(
      { error: "You don't have permission in this community" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if a user is banned from a community.
 */
export async function isBannedFromCommunity(userId: string, communityId: string): Promise<boolean> {
  const ban = await prisma.communityBan.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });
  return !!ban;
}
