'use server'

import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  await prisma.workflow.delete({
    where: {
      userId,
      id
    }
  });

  revalidatePath('/workflows');
}