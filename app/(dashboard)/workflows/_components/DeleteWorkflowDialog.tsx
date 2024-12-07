'use client';

import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { DeleteWorkflow } from '@/actions/workflows/deleteWorkflow';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  workflowName: string;
  workflowId: string;
  setOpen: (open: boolean) => void;
}

function DeleteWorkflowDialog({ open, setOpen, workflowName, workflowId }: Props) {
  const [confirmText, setConfirmText] = useState('');
  const {mutate, isPending} = useMutation({
    mutationFn: DeleteWorkflow,
    onSuccess: () => {
      toast.success('Workflow deleted successfully', { id: workflowId });
      setConfirmText("");
    },
    onError: () => {
      toast.error('Failed to delete workflow', { id: workflowId });
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              If you delete this workflow, you will not be able to recover it.
              <div className='flex flex-col py-4 gap-2'>
                <p>If you are sure, enter <b>{workflowName}</b> to confirm :</p>
                <Input 
                  value={confirmText} 
                  onChange={e => setConfirmText(e.target.value)} 
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={confirmText !== workflowName || isPending}
            onClick={() => {
              toast.loading("Deleting workflow...", { id: workflowId });
              mutate(workflowId);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteWorkflowDialog