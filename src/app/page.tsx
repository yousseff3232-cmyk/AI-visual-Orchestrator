"use client";
import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, BackgroundVariant, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import PromptNode from '../components/PromptNode';

const nodeTypes = { prompt: PromptNode };

const initialNodes = [
  {
    id: '1',
    type: 'prompt',
    position: { x: 300, y: 150 },
    data: { prompt: 'Is this a support request?' },
  },
];

// نوع البيانات عشان نسجل الرحلة
type PathStep = {
  nodeId: string;
  prompt: string;
  decision: string;
  nextNodeId: string | null;
};

function WorkflowEditorContent() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const [isFiring, setIsFiring] = useState(false);

  // التحكم في النافذة المنبثقة والداتا
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [executionPath, setExecutionPath] = useState<PathStep[]>([]);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params: any) =>
    setEdges((eds) => addEdge({ ...params, animated: false, style: { stroke: '#64748b', strokeWidth: 3 } }, eds)), []);

  const addNode = () => {
    const randomOffset = Math.random() * 150;
    const newNode = {
      id: Date.now().toString(),
      type: 'prompt',
      position: { x: 100 + randomOffset, y: 100 + randomOffset },
      data: { prompt: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const runWorkflow = async () => {
    if (nodes.length === 0) return alert("Please add at least one AI Node!");

    setIsFiring(true);
    setIsRouteOpen(false); // نقفل النافذة لو مفتوحة عشان نركز على الأنيميشن
    setExecutionPath([]); // نصفر الداتا القديمة

    setEdges(eds => eds.map(e => ({...e, animated: false, style: { stroke: '#64748b', strokeWidth: 3 }})));

    let currentNode = nodes.find(n => n.data.prompt && n.data.prompt.trim() !== '') || nodes[0];
    let currentSteps: PathStep[] = [];

    while (currentNode) {
      const prompt = currentNode.data.prompt || "Say YES";

      try {
        const res = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        const decision = data.decision?.replace(/[^a-zA-Z]/g, '').toUpperCase() || "YES";

        let edgeToAnimate = edges.find(e => e.source === currentNode?.id && e.sourceHandle === decision.toLowerCase());

        if (!edgeToAnimate) {
            edgeToAnimate = edges.find(e => e.source === currentNode?.id);
        }

        // نسجل الخطوة دي في الذاكرة عشان نعرضها في النافذة
        currentSteps.push({
          nodeId: currentNode.id,
          prompt: prompt,
          decision: decision,
          nextNodeId: edgeToAnimate ? edgeToAnimate.target : null
        });
        setExecutionPath([...currentSteps]);

        if (edgeToAnimate) {
          setEdges(eds => eds.map(e => {
            if (e.id === edgeToAnimate?.id) {
              return {
                ...e,
                animated: true,
                style: {
                  stroke: decision === 'YES' ? '#10b981' : '#f43f5e',
                  strokeWidth: 4,
                  filter: `drop-shadow(0 0 10px ${decision === 'YES' ? '#10b981' : '#f43f5e'})`
                }
              };
            }
            return e;
          }));

          await new Promise(r => setTimeout(r, 1200));
          currentNode = nodes.find(n => n.id === edgeToAnimate?.target);
        } else {
          currentNode = undefined;
        }
      } catch (error) {
        alert("⚠️ Connection error!");
        break;
      }
    }

    setIsFiring(false);
    // تفتح النافذة أوتوماتيك بأناقة أول ما الخريطة تخلص رحلتها
    setIsRouteOpen(true);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 font-sans">

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
            AI Flow Orchestrator
          </h1>
        </div>

        {/* أزرار التحكم (التلاتة مع بعض) */}
        <div className="flex gap-4">

          <button
            onClick={addNode}
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
          >
            <span className="text-lg group-hover:rotate-90 transition-transform duration-300">+</span>
            Add AI Node
          </button>

          <button
            onClick={runWorkflow}
            disabled={isFiring}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
          >
            ▶ {isFiring ? 'Running...' : 'Run Flow'}
          </button>

          {/* الزرار التالت الجديد (View Route) */}
          <button
            onClick={() => setIsRouteOpen(true)}
            className="relative group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
          >
            {executionPath.length > 0 && !isRouteOpen && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
              </span>
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            View Route
          </button>

        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-grow relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          minZoom={0.05}
          maxZoom={5}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} color="#334155" gap={20} size={2} />
          <Controls
            className="bg-slate-800 border-slate-700 rounded-md overflow-hidden shadow-lg [&>button]:bg-slate-800 [&>button]:border-b-slate-700 [&>button>svg]:fill-slate-400 hover:[&>button]:bg-slate-700 hover:[&>button>svg]:fill-white [&>button]:transition-all"
          />
        </ReactFlow>
      </div>

      {/* النافذة المنبثقة (Modal) للشبكة المصغرة */}
      {isRouteOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">

          <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Execution Route Analysis</h2>
                  <p className="text-slate-400 text-xs font-medium">Live tracking of the AI decision path</p>
                </div>
              </div>
              <button
                onClick={() => setIsRouteOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - الشبكة المصغرة */}
            <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

              {executionPath.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-lg font-medium text-slate-400">No route data available yet.</p>
                  <p className="text-sm mt-1">Run the flow first to generate the route map.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center max-w-lg mx-auto w-full">
                  {executionPath.map((step, index) => (
                    <div key={index} className="w-full flex flex-col items-center">

                      {/* البوكس بتاع النود */}
                      <div className="w-full bg-slate-800/80 rounded-xl p-5 border border-slate-700 shadow-md relative group hover:border-slate-500 transition-colors">
                        <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest shadow-lg">
                          NODE {step.nodeId}
                        </div>
                        <div className="mt-2 text-sm text-slate-200 font-medium leading-relaxed">
                          <span className="text-slate-500 font-bold mr-2">Q:</span>
                          "{step.prompt}"
                        </div>
                      </div>

                      {/* سهم التوصيل والقرار */}
                      {step.nextNodeId ? (
                        <div className="flex flex-col items-center my-1 w-full relative">
                          <div className="w-0.5 h-6 bg-slate-600/50"></div>

                          {/* بادج القرار على السهم نفسه */}
                          <div className={`z-10 text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg ${
                            step.decision === 'YES' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}>
                            AI Decision: {step.decision}
                          </div>

                          <div className="w-0.5 h-6 bg-slate-600/50"></div>
                          {/* رأس السهم */}
                          <svg className="w-4 h-4 text-slate-600/50 -mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center my-2 w-full">
                          <div className="w-0.5 h-8 bg-slate-600/50 border-dashed border-l-2 border-slate-600"></div>
                          <div className="z-10 text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 uppercase tracking-widest shadow-md">
                            End of Flow
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900 rounded-b-2xl">
              <button
                onClick={() => setIsRouteOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
}