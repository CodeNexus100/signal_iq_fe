
import React, { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { RefreshCw, Save, Database, Download } from 'lucide-react';

const ReproducibilityControls: React.FC = () => {
  const seed = useSimulationStore(state => state.seed);
  const setSeed = useSimulationStore(state => state.setSeed);
  const metrics = useSimulationStore(state => state.metrics);
  const history = useSimulationStore(state => state.metricsHistory);

  const [localSeed, setLocalSeed] = useState(seed);

  const handleRestart = () => {
      setSeed(localSeed);
      // Trigger backend restart via API
      fetch('http://localhost:8001/api/simulation/restart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seed: localSeed })
      }).catch(e => console.error("Failed to restart", e));
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", `experiment_seed_${seed}_results.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <Database size={20} />
             </div>
             <h3 className="font-bold text-lg">Reproducibility</h3>
        </div>

        <div className="flex gap-2">
            <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-3 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">SEED</span>
                <input
                    type="number"
                    value={localSeed}
                    onChange={(e) => setLocalSeed(parseInt(e.target.value))}
                    className="bg-transparent border-none outline-none text-white font-mono font-bold w-full text-sm"
                />
            </div>
            <button
                onClick={handleRestart}
                className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors"
                title="Restart with Seed"
            >
                <RefreshCw size={16} />
            </button>
        </div>

        <div className="p-3 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50 space-y-2">
             <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase">Tick Rate</span>
                  <span className="font-mono text-slate-300">10 Hz (100ms)</span>
             </div>
             <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase">Current Tick</span>
                  <span className="font-mono text-slate-300">#{metrics.tick}</span>
             </div>
        </div>

        <button
            onClick={handleExport}
            className="w-full py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
            <Download size={14} />
            Export Experiment Data
        </button>
    </div>
  );
};

export default ReproducibilityControls;
