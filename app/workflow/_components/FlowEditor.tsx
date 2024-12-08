"use client";

import React, { useCallback, useEffect } from 'react'
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, getOutgoers, Node, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import { Workflow } from '@prisma/client'
import '@xyflow/react/dist/style.css'
import NodeComponent from './nodes/NodeComponent';
import { toast } from 'sonner';
import { createFlowNode } from '@/lib/workflow/createFlowNode';
import { AppNode } from '@/types/app-nodes';
import { TaskType } from '@/types/tasks';
import DeletablesEdge from './edges/DeletablesEdge';
import { TaskRegistry } from '@/lib/workflow/task/Registry';

const nodeTypes = {
  FlowScrapeNode: NodeComponent,
};

const edgeTypes = {
  default: DeletablesEdge,
}

const fitViewOptions = { padding: 1 };

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { screenToFlowPosition, updateNodeData } = useReactFlow();

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
  }, [screenToFlowPosition, setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, animated: true }, eds));

    if (!connection.targetHandle) return;

    const node = nodes.find((n) => n.id === connection.target);

    if (!node) return;

    const nodeInputs = node.data.inputs;
    delete nodeInputs[connection.targetHandle];
    updateNodeData(node.id, { inputs: nodeInputs });
  }, [setEdges, updateNodeData, nodes]);

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    if (connection.source === connection.target) return false;

    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode) {
      console.error('invalid connection: source or target node not found');
      return false;
    }

    const sourceTask = TaskRegistry[sourceNode?.data.type];
    const targetTask = TaskRegistry[targetNode?.data.type];

    const output = sourceTask.outputs.find((o) => o.name === connection.sourceHandle);
    const input = targetTask.inputs.find((o) => o.name === connection.targetHandle);

    if (output?.type !== input?.type) return false;

    const hasCycle = (node: Node, visited = new Set()) => {
      if (visited.has(node.id)) return false;

      visited.add(node.id);

      for (const outgoer of getOutgoers(node, nodes, edges)) {
        if (outgoer.id === connection.source) return true;
        if (hasCycle(outgoer, visited)) return true;
      }
    };

    return !hasCycle(targetNode);
  }, [nodes, edges]);

  return (
    <main className='h-full w-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={fitViewOptions}
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
      >
        <Controls position='top-left' fitViewOptions={fitViewOptions} />
        <Background variant={BackgroundVariant.Dots} gap={12} />
      </ReactFlow>
    </main>
  )
}

export default FlowEditor