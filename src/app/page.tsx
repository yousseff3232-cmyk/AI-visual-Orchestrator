"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import PromptNode from '../components/PromptNode';

const nodeTypes = { prompt: PromptNode };

const initialNodes = [
  {
    id: '1',
    type: 'prompt',
    position: { x: 250, y: 100 },
    data: { prompt: 'Is this a support request?' },
  },
];

export default function WorkflowEditor() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);

  const addNode = () => {
    const newNode = {
      id: Math.random().toString(),
      type: 'prompt',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { prompt: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold">AI Workflow Editor</h1>
        <button onClick={addNode} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition-colors">
          + Add AI Node
        </button>
      </div>

      <div className="flex-grow bg-slate-50 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}