"use client";

import { useState } from "react";
import { signIn as emailSignIn } from "next-auth/react"; 
import { signIn as passkeySingIn } from "next-auth/webauthn"
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Имя провайдера в Auth.js v5 обычно "resend" или "nodemailer"
      const result = await emailSignIn("resend", {
        email,
        redirectTo: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Не удалось отправить ссылку. Проверьте адрес почты.");
      } else {
        setMessage(`Ссылка для входа отправлена на ${email}. Проверьте почту.`);
        setEmail("");
      }
    } catch (err) {
      setError("Произошла непредвиденная ошибка.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Вход с использованием Passkey (WebAuthn)
  const handlePasskeySignIn = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Для Passkeys обязательно передавать action: "authenticate" при входе
      const result = await passkeySingIn("passkey", { 
        action: "authenticate",
        redirectTo: "/",
        redirect: false
      });

      if (result?.error) {
        // Если пользователь отменил операцию в браузере
        if (result.error.includes("WebAuthnTriggers")) {
          setError("Вход отменен или устройство не поддерживает Passkey.");
        } else {
          setError("Не удалось войти с Passkey. Убедитесь, что вы зарегистрированы.");
        }
      }
    } catch (err) {
      setError("Ошибка при взаимодействии с ключом безопасности.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="place-self-center">
            <Image
              src="/icons/logo-transparent.png"
              width={192}
              height={192}
              alt="logo"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма email */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Вход через Email
            </Button>
          </form>

          {/* Разделитель */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">или</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Кнопка Passkey */}
          <Button
            onClick={handlePasskeySignIn}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {!loading && (
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            )}
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Войти с Passkey
          </Button>
          
          {/* Сообщения об успехе/ошибке */}
          {message && <p className="text-sm text-green-600 text-center font-medium">{message}</p>}
          {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}

        </CardContent>
      </Card>
    </div>
  );
}