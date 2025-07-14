import { prisma } from "@repo/db/prismaClient";
import { NextResponse } from "next/server";

export const GET = async (
  _: unknown,
  { params }: { params: { roomId: string } }
) => {
  try {
    const { roomId } = await params;
    const chats = await prisma.chats.findMany({
      where: { roomId },
      select: { startX: true, startY: true, width: true, height: true },
    });

    if (!chats) {
      return NextResponse.json({ status: 204 });
    }

    return NextResponse.json(
      {
        success: true,
        data: chats,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Something went wrong:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
};
