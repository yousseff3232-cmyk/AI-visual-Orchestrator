import { Handle, Position } from 'reactflow';

export default function PromptNode({ data }: { data: any }) {
  return (
    <div className="group relative bg-slate-900 border-2 border-slate-700 rounded-xl shadow-lg hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 w-[340px] flex flex-col">

      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-blue-500 border-2 border-slate-900" />

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 rounded-t-[10px]">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="text-xl">🤖</span> AI Decision Node
        </h3>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">System Prompt</label>
        <textarea
          className="w-full p-3 text-sm bg-slate-800 border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all shadow-inner placeholder-slate-500"
          rows={4}
          placeholder="Ask a question (YES/NO expected)..."
          defaultValue={data.prompt}
          onChange={(e) => data.onChange && data.onChange(e.target.value)}
        />
      </div>

      <div className="flex justify-between px-10 pb-4">
        <span className="text-xs font-black text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] tracking-wider">YES</span>
        <span className="text-xs font-black text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] tracking-wider">NO</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '20%' }}
        className="w-5 h-5 bg-emerald-500 border-4 border-slate-900 hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '80%' }}
        className="w-5 h-5 bg-rose-500 border-4 border-slate-900 hover:scale-125 transition-transform"
      />
    </div>
  );
}