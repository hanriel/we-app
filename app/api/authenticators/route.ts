import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.auth.user?.id;

  try {
    const authenticators = await prisma.authenticator.findMany({
      where: { userId },
      select: {
        credentialID: true,
        credentialDeviceType: true,
        credentialBackedUp: true,
        // transports тоже можно, но не обязательно
      },
    });

    return NextResponse.json(authenticators);
  } catch (error) {
    console.error("Error fetching authenticators:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
});