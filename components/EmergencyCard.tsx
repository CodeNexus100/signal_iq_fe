
import React from 'react';
import { Siren, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../src/store/useSimulationStore';

const EmergencyCard: React.FC = () => {
  const emergency = useSimulationStore(state => state.emergency);
  const isActive = !!emergency?.active;

  const setActive = (val: boolean) => {
    const endpoint = val ? 'start' : 'stop';
    fetch(`http://localhost:8001/api/emergency/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error(`Failed to ${endpoint} emergency`, e));

    // Optimistic update
    // We update local store assuming success, but for emergency it's tricky as we need details.
    // If stopping, we can set null. If starting, we wait for poll or set placeholder?
    // Let's set null on stop.
    if (!val) {
        useSimulationStore.getState().setEmergency(null);
    }
  };

  return (
    <div className={`bg-slate-900/40 border transition-all duration-500 rounded-2xl p-6 flex flex-col gap-4 shadow-xl ${
      isActive ? 'border-red-500/50 shadow-red-500/10' : 'border-slate-700/50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-700/50 text-slate-400'}`}>
            <Siren size={20} />
          </div>
          <h3 className={`font-bold transition-colors ${isActive ? 'text-red-500' : ''}`}>Emergency Priority</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setActive(e.target.checked)} className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>

      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Active Scenario: Ambulance {emergency?.id || 'Unknown'}</span>
              <div className="flex justify-between items-end">
                <p className="text-2xl font-bold font-mono">ETA: 01:45</p>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  -28% reduced time
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                <span>Signal Interlocking</span>
                <span>5 / 9 Cleared</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[55%]" />
              </div>
            </div>

            <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors border border-red-500/20 flex items-center justify-center gap-2">
              View Priority Route <ChevronRight size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2 border-2 border-dashed border-slate-800 rounded-xl"
          >
            <span className="text-xs font-medium">No Active Emergency Routes</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Standby Mode</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyCard;
