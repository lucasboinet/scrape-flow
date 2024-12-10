'use server'

import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowPhaseDetails(phaseId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  return prisma.executionPhase.findUnique({
    where: {
      id: phaseId,
      execution: {
        userId,
      }
    },
    include: {
      logs: {
        orderBy: {
          timestamp: 'asc'
        }
      },
    }
  })
}