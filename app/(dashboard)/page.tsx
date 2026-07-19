import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Gift,
  Bell,
  ShoppingCart,
  Plane,
  CheckSquare,
  Settings,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  // Массив разделов для отображения
  const sections = [
    {
      title: "Список желаний",
      description: "То, что хотите вместе",
      icon: Gift,
      href: "/wishes",
      color: "text-pink-500",
      colorStart: "from-pink-400",
      colorEnd: "to-pink-200",
    },
    {
      title: "Напоминания",
      description: "Важные даты и дела",
      icon: Bell,
      href: "/reminders",
      color: "text-yellow-500",
      colorStart: "from-yellow-400",
      colorEnd: "to-yellow-200",
    },
    {
      title: "Покупки для дома",
      description: "Что нужно купить",
      icon: ShoppingCart,
      href: "/shopping",
      color: "text-blue-500",
      colorStart: "from-blue-400",
      colorEnd: "to-blue-200",
    },
    {
      title: "Поездки",
      description: "Планируем вместе",
      icon: Plane,
      href: "/trips",
      color: "text-green-500",
      colorStart: "from-green-400",
      colorEnd: "to-green-200",
    },
    {
      title: "Привычки",
      description: "Личные и совместные",
      icon: CheckSquare,
      href: "/habits",
      color: "text-purple-500",
      colorStart: "from-purple-400",
      colorEnd: "to-purple-200",
    },
    {
      title: "Настройки",
      description: "Управление аккаунтом",
      icon: Settings,
      href: "/settings",
      color: "text-gray-500",
      colorStart: "from-gray-400",
      colorEnd: "to-gray-200",
    },
  ];

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Привет, Даня 👋</h1>
          </div>
        </div>

        {/* Сетка карточек разделов */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <Card className={`h-full transition-shadow aspect-square sm:aspect-auto bg-linear-to-t ${section.colorStart} ${section.colorEnd} hover:shadow-lg cursor-pointer`}>
                  <CardHeader className="flex flex-col gap-2">
                    <div className={`rounded-lg p-3 text-${section.color}-500`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className={`${section.color} text-md font-bold`}>{section.title}</CardTitle>
                      <CardDescription className="text-sm">{section.description}</CardDescription>
                    </div>
                  </CardHeader>
                  {/* <CardContent>
                    {/* Можно добавить краткую сводку, например, количество записей 
                  </CardContent> */}
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Дополнительный блок (например, последние действия) */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Совместная статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-500">Желаний</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-gray-500">Напоминаний</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-xs text-gray-500">Покупок</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-gray-500">Поездки</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}