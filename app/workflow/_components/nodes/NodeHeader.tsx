'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskRegistry } from '@/lib/workflow/task/Registry';
import { TaskType } from '@/types/tasks';
import { CoinsIcon, GripVerticalIcon } from 'lucide-react';
import React from 'react'

function NodeHeader({ taskType }: { taskType: TaskType }) {
  const task = TaskRegistry[taskType];

  return (
    <div className='flex items-center gap-2 p-2'>
      <task.icon size={16} />
      <div className='flex justify-between items-center w-full'>
        <p className='text-xs font-bold uppercase text-muted-foreground'>
          {task.label}
        </p>
        <div className="flex gap-1 items-center">
          {task.isEntryPoint && (
            <Badge>Start</Badge>
          )}
            <Badge className='text-xs gap-2 flex items-center'>
              <CoinsIcon size={16} />
              TODO
            </Badge>
            <Button 
              variant={"ghost"} 
              size={'icon'} 
              className='drag-handle cursor-grab'
            >
              <GripVerticalIcon size={20} />
            </Button>
        </div>
      </div>
    </div>
  )
}

export default NodeHeader