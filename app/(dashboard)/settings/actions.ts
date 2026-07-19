// app/settings/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserName(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Не авторизован");
  }

  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0) {
    throw new Error("Имя не может быть пустым");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  revalidatePath("/settings");
  return { success: true };
}