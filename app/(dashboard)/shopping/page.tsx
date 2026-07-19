import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ShoppingListClient from "@/app/(dashboard)/shopping/ShoppingListClient";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default async function ShoppingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Получаем все покупки текущего пользователя (позже добавим общие)
  const items = await prisma.shoppingItem.findMany({
    where: { createdBy: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Преобразуем Decimal в number для передачи клиенту
  const itemsSerialized = items.map((item) => ({
    ...item,
    price: item.price ? Number(item.price) : null,
  }));

  return (
    <>
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <Button>
                    <Link href="/">
                        <ArrowBigLeft />
                    </Link>
                </Button> 
                <h1 className="text-3xl font-bold text-gray-900">Список покупок</h1>
                <ShoppingListClient items={itemsSerialized} />
            </div>
        </div>
    </>

);
}