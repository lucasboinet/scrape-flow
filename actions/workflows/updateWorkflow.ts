'use server'

import prisma from "@/lib/primsa";
import { WorkflowStatus } from "@/types/workflows";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UpdateWorkflow({ id, definition }: { id: string, definition: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      userId,
      id,
    }
  });

  if (!workflow) throw new Error('Workflow not found');

  if (workflow.status !== WorkflowStatus.DRAFT) throw Error("Workflow is not a draft");

  await prisma.workflow.update({
    where: {
      userId,
      id,
    },
    data: {
      definition
    }
  })

  revalidatePath('/workflows');
}