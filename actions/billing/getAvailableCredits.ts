'use server';

import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";

export async function GetAvailableCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UnAuthenticated");
  }

  const balance = await prisma.userBalance.findUnique({
    where: { userId }
  });

  if (!balance) return -1;

  return balance.credits;
}