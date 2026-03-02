import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const where: any = {};
    if (communityId) where.communityId = communityId;

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        community: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { title, content, communityId } = await req.json();

    if (!title || !content || !communityId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Must be community mod/admin to post announcements
    const roleCheck = await requireCommunityRole(user, communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const announcement = await prisma.announcement.create({
      data: { title, content, communityId },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
