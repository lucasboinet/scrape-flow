'use server';

import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowExecutionWithPhases(executionId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  const execution = await prisma.workflowExecution.findUnique({
    where: {
      userId,
      id: executionId
    },
    include: {
      phases: {
        orderBy: {
          number: 'asc'
        }
      },
    }
  })

  if (!execution) {
    throw new Error("Workflow execution not found")
  }

  return execution;
}