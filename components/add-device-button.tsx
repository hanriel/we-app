"use client";

import { useState } from "react";
import { signIn } from "next-auth/webauthn";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export function AddDeviceButton() {
  const [loading, setLoading] = useState(false);

  const handleAddDevice = async () => {
    setLoading(true);
    try {
      await signIn("passkey", {
        action: "register",
        callbackUrl: "/settings",
        redirect: false, // чтобы остаться на странице
      });
      // После успешной регистрации обновим страницу (можно сделать через редирект)
      window.location.reload();
    } catch (error) {
      console.error("Failed to add passkey:", error);
      alert("Не удалось добавить устройство. Попробуйте снова.");
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleAddDevice} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Добавить устройство
    </Button>
  );
}