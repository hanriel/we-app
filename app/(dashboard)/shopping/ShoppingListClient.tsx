"use client";

import { useState, useOptimistic } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Plus, Filter } from "lucide-react";
import { togglePurchased } from "./actions";

import {
  listShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  type ShoppingItem,
} from "@/lib/api-generated";

type FilterType = "all" | "active" | "purchased";

export default function ShoppingListClient({ items: initialItems }: { items: ShoppingItem[] }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");
  const [isAdding, setIsAdding] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["shopping"],
    queryFn: async () => (await listShoppingItems()).data ?? [],
  });

  // Оптимистичное добавление: элемент сразу виден, потом подтверждается инвалидацией
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items ?? [],
    (state, newItem: ShoppingItem) => [...state, newItem],
  );

  const create = useMutation({
    mutationFn: (input: { name: string; category?: string; quantity: number }) =>
      createShoppingItem({ body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isPurchased }: { id: string; isPurchased: boolean }) =>
      updateShoppingItem({ path: { id }, body: { isPurchased } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteShoppingItem({ path: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });

  const handleAdd = async (formData: FormData) => {
    setIsAdding(true);
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const quantity = Number(formData.get("quantity")) || 1;

    addOptimisticItem({
      id: `temp-${Date.now()}`,
      name,
      category: category || null,
      quantity,
      price: null,
      isPurchased: false,
    } as ShoppingItem);

    try {
      await create.mutateAsync({ name, category: category || undefined, quantity });
    } finally {
      setIsAdding(false);
    }
  };

  const filteredItems = optimisticItems.filter((item) => {
    if (filter === "active") return !item.isPurchased;
    if (filter === "purchased") return item.isPurchased;
    return true;
  });

  const activeCount = optimisticItems.filter((i) => !i.isPurchased).length;
  const totalCount = optimisticItems.length;


  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {activeCount} активных из {totalCount}
          </div>
        </div>

        {/* Форма добавления */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Добавить позицию</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleAdd} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="name" className="sr-only">
                  Название
                </Label>
                <Input id="name" name="name" placeholder="Название" required disabled={isAdding} />
              </div>
              <div className="w-32">
                <Label htmlFor="category" className="sr-only">
                  Категория
                </Label>
                <Input id="category" name="category" placeholder="Категория" disabled={isAdding} />
              </div>
              <div className="w-24">
                <Label htmlFor="quantity" className="sr-only">
                  Количество
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  defaultValue={1}
                  min={1}
                  disabled={isAdding}
                />
              </div>
              <Button type="submit" disabled={isAdding} className="gap-2">
                {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
                <Plus className="h-4 w-4" />
                Добавить
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Фильтр */}
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Не купленные</SelectItem>
              <SelectItem value="purchased">Купленные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Список */}
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Загрузка…</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Список пуст</p>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className={item.isPurchased ? "opacity-60" : ""}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={item.isPurchased}
                      onCheckedChange={() =>
                        toggle.mutate({ id: item.id, isPurchased: !item.isPurchased })
                      }
                    />
                    <div>
                      <p className={`font-medium ${item.isPurchased ? "line-through" : ""}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.category && `${item.category} • `}
                        {item.quantity} шт.
                        {item.price && ` • ${item.price} ₽`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove.mutate(item.id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}