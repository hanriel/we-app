import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Passkey from "next-auth/providers/passkey";
import Resend from "next-auth/providers/resend"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Passkey,
    Resend({
      // Будет автоматически искать AUTH_RESEND_KEY в вашем .env
      from: process.env.EMAIL_FROM || "onboarding@resend.dev", 
    }),
  ],
  experimental: {
    enableWebAuthn: true,
  },
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // Добавляем имя из базы (если есть)
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true },
        });
        if (user?.name) {
          session.user.name = user.name;
        }
      }
      return session;
    },
  },
});