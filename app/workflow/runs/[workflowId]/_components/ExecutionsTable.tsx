'use client';

import { GetWorkflowExecutions } from '@/actions/workflows/getWorkflowExecutions';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatesToDuration } from '@/lib/helper/dates';
import React from 'react'
import ExecutionStatusIndicator from './ExecutionStatusIndicator';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@/types/workflows';
import { CoinsIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import PhaseStatusBadge from '../[executionId]/_components/PhaseStatusBadge';
import TooltipWrapper from '@/components/TooltipWrapper';

type WorkflowExecutions = Awaited<ReturnType<typeof GetWorkflowExecutions>>;

function ExecutionsTable({ executions }: { executions: WorkflowExecutions }) {
  const router = useRouter();

  return (
    <div className='border rounded-lg shadow-md overflow-auto'>
      <Table className='h-full'>
        <TableHeader className='bg-muted'>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Consumed</TableHead>
            <TableHead>Phases</TableHead>
            <TableHead className='text-right text-xs text-muted-foreground'>Started at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='gap-2 h-full overflow-auto'>
          {executions.map((execution) => {
            const duration = DatesToDuration(execution.completedAt, execution.startedAt);
            const formattedStartedAt = execution.startedAt && formatDistanceToNow(execution.startedAt, { addSuffix: true });

            return (
              <TableRow 
                key={execution.id} 
                className='cursor-pointer' 
                onClick={() => router.push(`/workflow/runs/${execution.workflowId}/${execution.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{execution.id}</span>
                    <div className="text-muted-foreground text-xs flex items-center gap-1">
                      <span>Triggered via</span>
                      <Badge variant={'outline'}>{execution.trigger}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <ExecutionStatusIndicator status={execution.status as WorkflowExecutionStatus} />
                      <span className='font-semibold capitalize'>{execution.status}</span>
                    </div>
                    <div className='text-muted-foreground text-xs mx-5'>{duration}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <CoinsIcon size={16} className='text-primary' />
                      <span className='font-semibold capitalize'>{execution.creditsConsumed}</span>
                    </div>
                    <div className='text-muted-foreground text-xs mx-5'>Credits</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1'>
                    {execution.phases.map((phase) => (
                      <TooltipWrapper key={phase.id} content={phase.name}>
                        <div>
                          <PhaseStatusBadge status={phase.status as ExecutionPhaseStatus} />
                        </div>
                      </TooltipWrapper>
                    ))}
                  </div>
                </TableCell>
                <TableCell className='text-right text-muted-foreground'>
                  {formattedStartedAt}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default ExecutionsTable