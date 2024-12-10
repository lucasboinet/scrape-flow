'use client'

import { ExecuteWorkflow } from '@/actions/workflows/executeWorkflow'
import useExecutionPlan from '@/components/hooks/useExecutionPlan'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { PlayIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function ExecuteButton({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();
  const { toObject } = useReactFlow();

  const {mutate, isPending} = useMutation({
    mutationFn: ExecuteWorkflow,
    onSuccess: () => {
      toast.success("Workflow execution started", { id: "workflow-execution" });
    },
    onError: () => {
      toast.error('Something went wrong, please try again', { id: "workflow-execution" });
    }
  })

  return (
    <Button
      variant={'outline'}
      className='flex items-center gap-2'
      onClick={() => {
        const plan = generate();

        if (!plan) return;

        mutate({ 
          workflowId, 
          flowDefinition: JSON.stringify(toObject()),
        });
      }}
      disabled={isPending}
    >
      <PlayIcon size={16} className='stroke-orange-400' />
      Execute
    </Button>
  )
}

export default ExecuteButton