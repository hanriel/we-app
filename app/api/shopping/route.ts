import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  price: z.number().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

const items = await prisma.shoppingItem.findMany({
  where: { creator: { id: session.user.id }},
  orderBy: { createdAt: "desc" },
});
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const item = await prisma.shoppingItem.create({
    data: {
      name: body.data.name,
      category: body.data.category ?? null,
      quantity: body.data.quantity,
      price: body.data.price ?? null,
      creator: {
        connect: { id: session.user.id },
      },
    },
  });
  return NextResponse.json(item, { status: 201 });
}
