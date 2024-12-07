'use server'

import prisma from "@/lib/primsa";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import { createWorkflowSchema, CreateWorkflowSchemaType } from "@/schema/workflows";
import { AppNode } from "@/types/app-nodes";
import { TaskType } from "@/types/tasks";
import { WorkflowStatus } from "@/types/workflows";
import { auth } from "@clerk/nextjs/server";
import { Edge } from "@xyflow/react";
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

  const initialWorkflow: { nodes: AppNode[], edges: Edge[] } = {
    nodes: [],
    edges: [],
  };

  initialWorkflow.nodes.push(createFlowNode(TaskType.LAUNCH_BROWSER));

  const result = await prisma.workflow.create({
    data: {
      userId,
      status: WorkflowStatus.DRAFT,
      definition: JSON.stringify(initialWorkflow),
      ...data,
    }
  });

  if (!result) {
    throw new Error('Failed to create workflow');
  }

  redirect(`/workflow/editor/${result.id}`);
}