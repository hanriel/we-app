import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const DELETE = auth(async function DELETE(req, { params }: { params: { credentialID: string } }) {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.auth.user?.id;
  const { credentialID } = params;

  try {
    // Проверяем, что ключ принадлежит текущему пользователю
    const authenticator = await prisma.authenticator.findUnique({
      where: { credentialID },
      select: { userId: true },
    });

    if (!authenticator) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    if (authenticator.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.authenticator.delete({
      where: { credentialID },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting authenticator:", error);
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    );
  }
});