import { Handle, Position, useReactFlow } from 'reactflow';
export default function PromptNode({ id, data }: { id: string, data: any }) {
  const { setNodes, setEdges } = useReactFlow();
  const deleteNode = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const handleTextChange = (e: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, prompt: e.target.value } } : node
      )
    );
  };

  return (
    <div className="group relative bg-slate-900 border-2 border-slate-700 rounded-xl shadow-lg hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 w-[340px] flex flex-col">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-blue-500 border-2 border-slate-900" />
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 rounded-t-[10px] flex justify-between items-center">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="text-xl">🤖 </span> AI Decision Node
        </h3>
        <button onClick={deleteNode} className="text-white/60 hover:text-rose-400 hover:bg-white/10 p-1.5 rounded-md transition-all active:scale-75">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">System Prompt</label>
        <textarea
          className="w-full p-3 text-sm bg-slate-800 border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all shadow-inner placeholder-slate-500"
          rows={4}
          placeholder="Ask a question (YES/NO expected)..."
          value={data.prompt}
          onChange={handleTextChange}
        />
      </div>

      <div className="flex justify-between px-10 pb-4">
        <span className="text-xs font-black text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] tracking-wider">YES</span>
        <span className="text-xs font-black text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] tracking-wider">NO</span>
      </div>

      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '20%' }} className="w-5 h-5 bg-emerald-500 border-4 border-slate-900 hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '80%' }} className="w-5 h-5 bg-rose-500 border-4 border-slate-900 hover:scale-125 transition-transform" />
    </div>
  );
}