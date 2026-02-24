
import React from 'react';
import { useSimulationStore, ControllerMode } from '../../store/useSimulationStore';
import { Sliders, Brain, Play, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

const ControllerPanel: React.FC = () => {
  const controllerMode = useSimulationStore(state => state.controllerMode);
  const setControllerMode = useSimulationStore(state => state.setControllerMode);
  const aiStatus = useSimulationStore(state => state.aiStatus);

  const handleModeChange = (mode: ControllerMode) => {
      setControllerMode(mode);
      // Trigger backend mode switch
      fetch('http://localhost:8001/api/simulation/mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
      }).catch(e => console.error("Failed to switch mode", e));
  };

  const modes: { id: ControllerMode, label: string, icon: React.ReactNode }[] = [
      { id: 'FIXED', label: 'Fixed Cycle', icon: <Sliders size={16} /> },
      { id: 'HEURISTIC', label: 'Heuristic', icon: <Play size={16} /> },
      { id: 'ML', label: 'RL Model', icon: <Brain size={16} /> },
      { id: 'HYBRID', label: 'Hybrid', icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Brain size={20} />
             </div>
             <h3 className="font-bold text-lg">Traffic Controller Mode</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {modes.map(mode => (
                <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className={clsx(
                        "flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-bold",
                        controllerMode === mode.id
                            ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20"
                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                >
                    {mode.icon}
                    {mode.label}
                </button>
            ))}
        </div>

        {/* Dynamic AI Feedback Section */}
        {controllerMode !== 'FIXED' && (
            <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block mb-2">
                    {controllerMode} Strategy
                </span>

                {aiStatus ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-400">Next Adjustment:</span>
                             <span className="text-emerald-400 font-bold">{aiStatus.recommendation?.action || "Hold"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-400">Confidence:</span>
                             <span className="text-white font-mono">{Math.round((aiStatus.efficiency || 0) * 100) / 100}%</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-slate-500 italic">Waiting for strategy output...</span>
                )}
            </div>
        )}
    </div>
  );
};

export default ControllerPanel;
