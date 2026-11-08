"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
