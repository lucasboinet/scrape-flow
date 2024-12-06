"use client";

import React from 'react'
import { Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import { Workflow } from '@prisma/client'
import '@xyflow/react/dist/style.css'
import { createFlowNode } from '@/lib/workflow/createFlowNode';
import { TaskType } from '@/types/tasks';
import NodeComponent from './nodes/NodeComponent';

const nodeTypes = {
  FlowScrapeNode: NodeComponent,
};

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([createFlowNode(TaskType.LAUNCH_BROWSER)])
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <main className='h-full w-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
      >
        <Controls position='top-left' />
        <Background variant={BackgroundVariant.Dots} gap={12} />
      </ReactFlow>
    </main>
  )
}

export default FlowEditor