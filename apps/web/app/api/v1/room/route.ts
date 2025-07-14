import { prisma } from "@repo/db/prismaClient";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { slug } = await req.json();

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

    if (existingRoom) {
      return NextResponse.json(
        {
          success: true,
          data: existingRoom,
        },
        { status: 200 }
      );
    }

    const room = await prisma.rooms.create({
      data: {
        slug,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: room,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Something went wrong. ", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
};
