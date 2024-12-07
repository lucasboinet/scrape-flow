'use client'

import { UpdateWorkflow } from '@/actions/workflows/updateWorkflow'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { CheckIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function SaveButton({ workflowId }: { workflowId: string }) {
  const { toObject } = useReactFlow();
  const {mutate, isPending} = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success('Workflow saved successfully', { id: 'save-workflow' });
    },
    onError: () => {
      toast.error('Failed to save workflow', { id: 'save-workflow' });
    },
  })

  return (
    <Button
      variant={"outline"}
      className='flex items-center gap-2'
      disabled={isPending}
      onClick={() => {
        const definition = JSON.stringify(toObject());
        toast.loading("Saving workflow", { id: 'save-workflow' })
        mutate({ id: workflowId, definition });
      }}
    >
      <CheckIcon size={16} className='stroke-green-400' />
      Save
    </Button>
  )
}

export default SaveButton