import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalPrisma.prisma = prisma;
