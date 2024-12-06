'use server';

import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";

export async function GetUserWorkflows() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  return prisma.workflow.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
}