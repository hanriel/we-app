import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const patchSchema = z.object({
  isPurchased: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const item = await prisma.shoppingItem.update({
    where: { id, creator: { id: session.user.id } },
    data: {
      ...(body.data.isPurchased !== undefined && {
        isPurchased: body.data.isPurchased,
        purchasedAt: body.data.isPurchased ? new Date() : null,
      }),
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.shoppingItem.delete({ where: { id, creator: { id: session.user.id } } });
  return new NextResponse(null, { status: 204 });
}
