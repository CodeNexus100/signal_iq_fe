
import React from 'react';
import { Database, Wifi, Video, Cloud } from 'lucide-react';

const InfraStatus: React.FC = () => {
  const sensors = [
    { label: 'IoT Sensors', status: 'Online', icon: Wifi, color: 'text-emerald-400' },
    { label: 'Camera Network', status: 'Active', icon: Video, color: 'text-emerald-400' },
    { label: 'Edge Nodes', status: 'Connected', icon: Database, color: 'text-emerald-400' },
    { label: 'Cloud Sync', status: 'Stable', icon: Cloud, color: 'text-blue-400' },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Infrastructure Health</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {sensors.map((s) => (
          <div key={s.label} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <s.icon size={14} className="text-slate-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
            <span className="text-[10px] font-bold text-white truncate">{s.label}</span>
            <span className={`text-[10px] uppercase font-bold ${s.color}`}>{s.status}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 text-[10px] text-slate-500 font-medium">
        All systems operational. Last sync: 2.4s ago.
      </div>
    </div>
  );
};

export default InfraStatus;
