import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { isDemoUser, DEMO_COMMUNITY } from "@/lib/demo-data";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");
    const user = await getCurrentUser();
    if (mine === "true" && !user) return unauthorized();
    if (isDemoUser(user?.email)) return NextResponse.json([DEMO_COMMUNITY]);

    if (mine === "true" && user) {
      const memberships = await prisma.communityMember.findMany({
        where: { userId: user.id },
        include: {
          community: {
            include: { _count: { select: { members: true, teams: true, leagues: true } } },
          },
        },
      });

      const created = await prisma.community.findMany({
        where: { createdById: user.id, isSuspended: false },
        include: { _count: { select: { members: true, teams: true, leagues: true } } },
      });

      const memberCommunities = memberships
        .filter((m) => !m.community.isSuspended)
        .map((m) => m.community);

      const allMap = new Map<string, typeof memberCommunities[0]>();
      [...memberCommunities, ...created].forEach((c) => allMap.set(c.id, c));

      // Self-heal: ensure creator has a CommunityMember row for each community they created
      const memberIds = new Set(memberships.map((m) => m.communityId));
      const missingMemberships = created.filter((c) => !memberIds.has(c.id));
      if (missingMemberships.length > 0) {
        await prisma.communityMember.createMany({
          data: missingMemberships.map((c) => ({
            userId: user.id,
            communityId: c.id,
            role: "COMMUNITY_MOD",
          })),
          skipDuplicates: true,
        });
      }

      return NextResponse.json(Array.from(allMap.values()));
    }

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

    // Any authenticated user can create a community; they become COMMUNITY_MOD of it
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
      },
      include: {
        _count: { select: { members: true, teams: true, leagues: true } },
      },
    });

    // Upsert member record (safe if already exists)
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: user.id, communityId: community.id } },
      update: { role: "COMMUNITY_MOD" },
      create: { userId: user.id, communityId: community.id, role: "COMMUNITY_MOD" },
    });

    // Ensure the user's global role is at least COMMUNITY_MOD so they can manage things
    if (user.role === "USER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "COMMUNITY_MOD" },
      });
    }

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
