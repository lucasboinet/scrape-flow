'use client'

import { Accordion, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '@/lib/workflow/task/Registry'
import { TaskType } from '@/types/tasks'
import { AccordionContent } from '@radix-ui/react-accordion'
import React from 'react'

function TasksMenu() {
  return (
    <aside className='w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate p-2 px-4 overflow-auto'>
      <Accordion type='multiple' className='w-full' defaultValue={['extraction']}>
        <AccordionItem value='extraction'>
          <AccordionTrigger className='font-bold'>
            Data extraction
          </AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuButton taskType={TaskType.PAGE_TO_HTML} />
            <TaskMenuButton taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  )
}

function TaskMenuButton({ taskType }: { taskType: TaskType }) {
  const task = TaskRegistry[taskType];

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", taskType);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <Button 
      draggable
      onDragStart={event => onDragStart(event)}
      variant={'secondary'} 
      className='flex justify-between items-center gap-2 border w-full'
    >
      <div className='flex gap-2'>
        <task.icon size={20} />
        {task.label}
      </div>
    </Button>
  )
}

export default TasksMenu