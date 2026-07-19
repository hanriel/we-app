"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/webauthn"
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, LogOut, User, ArrowBigLeft } from "lucide-react";
import { updateUserName } from "./actions";
import Link from "next/link";

interface Authenticator {
  credentialID: string;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [devices, setDevices] = useState<Authenticator[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  // Загрузка устройств
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/authenticators")
        .then((res) => res.json())
        .then((data) => {
          setDevices(data);
          setDevicesLoading(false);
        })
        .catch(() => setDevicesLoading(false));
    }
  }, [status]);

  // Обновление имени
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", name);

    try {
      const result = await updateUserName(formData);
      if (result.success) {
        await update();
        setMessage({ type: "success", text: "Имя обновлено!" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Ошибка обновления" });
    } finally {
      setLoading(false);
    }
  };

  // Удаление устройства
  const handleDeleteDevice = async (credentialID: string) => {
    if (!confirm("Удалить этот ключ доступа? Это устройство потеряет доступ.")) return;

    try {
      const res = await fetch(`/api/authenticators/${credentialID}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDevices(devices.filter((d) => d.credentialID !== credentialID));
        setMessage({ type: "success", text: "Устройство удалено" });
      } else {
        setMessage({ type: "error", text: "Не удалось удалить устройство" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка при удалении" });
    }
  };

  // Добавление устройства (новый Passkey)
  const handleAddDevice = async () => {
    await signIn("passkey", { action: "register", callbackUrl: "/settings" });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button>
            <Link
            href="/"
            ><ArrowBigLeft />
            </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>

        {/* Редактирование имени */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Профиль
            </CardTitle>
            <CardDescription>Измените ваше отображаемое имя</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  disabled={loading}
                />
              </div>
              {message && (
                <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {message.text}
                </p>
              )}
              <Button type="submit" disabled={loading || name === session.user?.name}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить имя
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Управление устройствами */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Устройства
            </CardTitle>
            <CardDescription>Устройства, с которых вы можете входить по Passkey</CardDescription>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : devices.length === 0 ? (
              <p className="text-gray-500">Нет зарегистрированных устройств</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <li key={device.credentialID} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">
                        {device.credentialDeviceType === "platform" ? "Встроенный (Touch ID / Face ID)" : "Внешний (USB / NFC)"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {device.credentialBackedUp ? "🔒 Резервное копирование включено" : "Без резервного копирования"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Добавлено: {new Date(device.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDevice(device.credentialID)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddDevice} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить устройство
            </Button>
          </CardFooter>
        </Card>

        {/* Выход */}
        <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant="destructive"
            className="w-full gap-2"
        >
            <LogOut className="h-4 w-4" />
            Выйти
        </Button>
      </div>
    </div>
  );
}