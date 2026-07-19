"use client";

import { useEffect, useState } from "react";
import { Loader2, Smartphone, Laptop, Monitor, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = {
  credentialID: string;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  createdAt: string;
};

export function DevicesList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/authenticators");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      setError("Не удалось загрузить устройства");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDelete = async (credentialID: string) => {
    if (!confirm("Удалить это устройство? Вы больше не сможете войти с него по Passkey.")) return;

    try {
      const res = await fetch(`/api/authenticators/${credentialID}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDevices((prev) => prev.filter((d) => d.credentialID !== credentialID));
    } catch (err) {
      alert("Не удалось удалить устройство");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (devices.length === 0) {
    return (
      <p className="text-sm text-gray-500">У вас ещё нет зарегистрированных устройств. Добавьте Passkey на этом устройстве.</p>
    );
  }

  const getIcon = (type: string) => {
    if (type.includes("phone") || type.includes("mobile")) return Smartphone;
    if (type.includes("laptop") || type.includes("computer")) return Laptop;
    return Monitor;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <ul className="space-y-3">
      {devices.map((device) => {
        const Icon = getIcon(device.credentialDeviceType);
        return (
          <li
            key={device.credentialID}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{device.credentialDeviceType || "Неизвестное устройство"}</p>
                <p className="text-xs text-gray-500">
                  Добавлено: {formatDate(device.createdAt)}
                  {device.credentialBackedUp && " • Backup"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(device.credentialID)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}