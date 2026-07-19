"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Схема валидации для добавления
const createSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  category: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

export async function createShoppingItem(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const quantity = Number(formData.get("quantity")) || 1;

  const validated = createSchema.parse({ name, category, quantity });

  await prisma.shoppingItem.create({
    data: {
      name: validated.name,
      category: validated.category || null,
      quantity: validated.quantity,
      createdBy: session.user.id,
    },
  });

  revalidatePath("/shopping");
  return { success: true };
}

export async function togglePurchased(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const item = await prisma.shoppingItem.findUnique({
    where: { id },
    select: { isPurchased: true, createdBy: true },
  });
  if (!item) throw new Error("Not found");
  if (item.createdBy !== session.user.id) {
    // Проверка, что пользователь имеет доступ (можно добавить shared логику позже)
    throw new Error("Forbidden");
  }

  await prisma.shoppingItem.update({
    where: { id },
    data: {
      isPurchased: !item.isPurchased,
      purchasedAt: !item.isPurchased ? new Date() : null,
    },
  });

  revalidatePath("/shopping");
}

export async function deleteShoppingItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const item = await prisma.shoppingItem.findUnique({
    where: { id },
    select: { createdBy: true },
  });
  if (!item) throw new Error("Not found");
  if (item.createdBy !== session.user.id) throw new Error("Forbidden");

  await prisma.shoppingItem.delete({ where: { id } });
  revalidatePath("/shopping");
}