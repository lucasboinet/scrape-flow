"use client";

import React, { useCallback, useEffect } from 'react'
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import { Workflow } from '@prisma/client'
import '@xyflow/react/dist/style.css'
import NodeComponent from './nodes/NodeComponent';
import { toast } from 'sonner';
import { createFlowNode } from '@/lib/workflow/createFlowNode';
import { AppNode } from '@/types/app-nodes';
import { TaskType } from '@/types/tasks';

const nodeTypes = {
  FlowScrapeNode: NodeComponent,
};

const fitViewOptions = { padding: 1 };

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    try {
      const definition = JSON.parse(workflow.definition);

      if (!definition) return;

      setNodes(definition.nodes || []);
      setEdges(definition.edges || []);
    } catch {
      toast.error("Something went wrong")
    }
  }, [workflow.definition, setEdges, setNodes])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const taskType = event.dataTransfer.getData('application/reactflow');
  
    if (typeof taskType === undefined || !taskType) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = createFlowNode(
      taskType as TaskType, 
      { x: position.x, y: position.y }
    );
    setNodes(nds => nds.concat(newNode));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    console.log(connection)
    setEdges(eds => addEdge({ ...connection, animated: true }, eds));
  }, []);

  return (
    <main className='h-full w-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitViewOptions={fitViewOptions}
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
      >
        <Controls position='top-left' fitViewOptions={fitViewOptions} />
        <Background variant={BackgroundVariant.Dots} gap={12} />
      </ReactFlow>
    </main>
  )
}

export default FlowEditor