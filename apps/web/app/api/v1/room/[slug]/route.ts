import { prisma } from "@repo/db/prismaClient";
import { NextResponse } from "next/server";

export const GET = async (
  _: unknown,
  { params }: { params: { slug: string } }
) => {
  try {
    const { slug } = await params;

    if (!slug) {
      console.log("No slug provided.");
      return NextResponse.json(
        {
          success: false,
          message: "No slug provided.",
        },
        { status: 400 }
      );
    }

    const existingRoom = await prisma.rooms.findUnique({
      where: {
        slug,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        {
          success: false,
          message: "Room not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: existingRoom,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Something went wrong. ", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
};
