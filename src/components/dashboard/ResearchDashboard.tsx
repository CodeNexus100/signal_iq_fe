
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { BarChart2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const ResearchDashboard: React.FC = () => {
  const history = useSimulationStore(state => state.metricsHistory);
  const metrics = useSimulationStore(state => state.metrics);

  // If we don't have enough history, fallback
  const data = history.length > 0 ? history : [metrics];

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
               <BarChart2 size={20} />
            </div>
            <h3 className="font-bold text-lg">Simulation Research Metrics</h3>
       </div>

       {/* Grid of Key Metrics */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Avg Wait Time</span>
               <div className="flex items-end gap-2">
                   <span className="text-xl font-bold font-mono">{metrics.avgWaitTime.toFixed(1)}s</span>
                   <TrendingUp size={14} className="text-emerald-400 mb-1" />
               </div>
           </div>
           <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Throughput</span>
               <div className="flex items-end gap-2">
                   <span className="text-xl font-bold font-mono">{metrics.throughput}</span>
                   <span className="text-[10px] text-slate-400 mb-1">v/h</span>
               </div>
           </div>
           <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Signal Switch Rate</span>
               <div className="flex items-end gap-2">
                   <span className="text-xl font-bold font-mono">{metrics.signalSwitchRate.toFixed(2)}</span>
                   <Clock size={14} className="text-amber-400 mb-1" />
               </div>
           </div>
           <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Emergency Delay</span>
               <div className="flex items-end gap-2">
                   <span className="text-xl font-bold font-mono text-red-400">{metrics.emergencyDelay}s</span>
                   <AlertTriangle size={14} className="text-red-400 mb-1" />
               </div>
           </div>
       </div>

       {/* Time Series: Wait Time */}
       <div className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl h-[250px]">
           <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">Wait Time Evolution (Last 50 Ticks)</h4>
           <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                   <defs>
                       <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                       </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="tick" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                   <Area type="monotone" dataKey="avgWaitTime" stroke="#818cf8" fillOpacity={1} fill="url(#colorWait)" strokeWidth={2} />
               </AreaChart>
           </ResponsiveContainer>
       </div>

       {/* Time Series: Throughput */}
       <div className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl h-[250px]">
           <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">Throughput (Vehicles / Hour)</h4>
           <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="tick" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                   <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
               </LineChart>
           </ResponsiveContainer>
       </div>
    </div>
  );
};

export default ResearchDashboard;
