'use client';

import { Workflow } from '@prisma/client'
import React from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import FlowEditor from './FlowEditor'
import Topbar from './topbar/Topbar'
import TasksMenu from './TasksMenu'
import { WorkflowValidationContextProvider } from '@/components/context/WorkflowValidationContext'

function Editor({ workflow }: { workflow: Workflow }) {
  return (
    <WorkflowValidationContextProvider>
      <ReactFlowProvider>
        <div className='flex flex-col h-full w-full overflow-hidden'>
          <Topbar title='Workflow editor' workflowId={workflow.id} />
          <section className='flex h-full overflow-auto'>
            <TasksMenu />
            <FlowEditor workflow={workflow} />
          </section>
        </div>
      </ReactFlowProvider>
    </WorkflowValidationContextProvider>
  )
}

export default Editor