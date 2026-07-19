"use server"

import { signIn } from "@/auth"

// Экшен для OAuth (Google, GitHub и т.д.)
export async function loginWithPasskey(providerId: "google" | "github") {
  await signIn(providerId, { redirectTo: "/dashboard" })
}

// Экшен для Email (Magic Link)
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string
  await signIn("resend", { email, redirectTo: "/dashboard" })
}