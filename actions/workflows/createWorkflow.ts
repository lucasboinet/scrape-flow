'use server'

import prisma from "@/lib/primsa";
import { createWorkflowSchema, CreateWorkflowSchemaType } from "@/schema/workflows";
import { WorkflowStatus } from "@/types/workflows";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateWorkflow(form: CreateWorkflowSchemaType) {
  const { success, data } = createWorkflowSchema.safeParse(form);

  if (!success) {
    throw new Error('Invalid form data');
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error('UnAuthenticated');
  }

  const result = await prisma.workflow.create({
    data: {
      userId,
      status: WorkflowStatus.DRAFT,
      defintion: "TODO",
      ...data,
    }
  });

  if (!result) {
    throw new Error('Failed to create workflow');
  }

  redirect(`/workflow/editor/${result.id}`);
}