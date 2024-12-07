import prisma from '@/lib/primsa';
import { auth } from '@clerk/nextjs/server';
import React from 'react'
import Editor from '../../_components/Editor';
import { Workflow } from '@prisma/client';

async function page({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;
  const { userId } = await auth();

  if (!userId) return <div>unauthenticated</div>

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    }
  })

  if (!userId) return <div>workflow not found</div>

  return <Editor workflow={workflow as Workflow} />
}

export default page