import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireRole } from "@/lib/session";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      where: { isSuspended: false },
      include: {
        _count: { select: { members: true, teams: true, leagues: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Only COMMUNITY_MOD or SUPER_ADMIN can create communities
    const roleCheck = requireRole(user, "COMMUNITY_MOD", "SUPER_ADMIN");
    if (roleCheck) return roleCheck;

    const { name, description, logo, banner } = await req.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Community name must be at least 2 characters" }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(name);
    const existing = await prisma.community.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create community + add creator as COMMUNITY_MOD member
    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        slug,
        description,
        logo,
        banner,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: "COMMUNITY_MOD",
          },
        },
      },
      include: {
        _count: { select: { members: true, teams: true, leagues: true } },
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
