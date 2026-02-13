
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sliders, Zap, Search, ArrowRightLeft, Clock, Power } from 'lucide-react';
import { IntersectionStatus } from '../types';

interface SignalControlViewProps {
  intersection: IntersectionStatus;
  aiEnabled: boolean;
  setAiEnabled: (val: boolean) => void;
}

const intersections = [
  { id: 'I-104', name: 'MG Road & Park St', status: 'Nominal', type: '4-Way', nsTime: 30, ewTime: 25, load: 'High' },
  { id: 'I-105', name: 'Broadway & Main', status: 'AI Optimized', type: '4-Way', nsTime: 45, ewTime: 45, load: 'Moderate' },
  { id: 'I-106', name: 'Bridgeside & 2nd', status: 'Manual', type: '3-Way', nsTime: 20, ewTime: 40, load: 'Low' },
  { id: 'I-107', name: 'Skyline & Sunset', status: 'Nominal', type: '4-Way', nsTime: 35, ewTime: 30, load: 'High' },
];

const SignalControlView: React.FC<SignalControlViewProps> = ({ intersection, aiEnabled, setAiEnabled }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Signal Control</h1>
          <p className="text-slate-400 text-sm">Direct intersection overriding and cycle management</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-sm font-bold shadow-lg shadow-blue-600/20">
            <Zap size={16} />
            Bulk AI Optimize
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl transition-all text-sm font-bold">
            <Power size={16} />
            Emergency Flush
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
             <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-widest">Active Intersections</h3>
             {intersections.map(i => (
               <button 
                 key={i.id}
                 className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                   i.id === 'I-104' ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-slate-800'
                 }`}
               >
                 <div>
                   <p className={`text-sm font-bold ${i.id === 'I-104' ? 'text-blue-400' : 'text-white'}`}>{i.id}</p>
                   <p className="text-[10px] text-slate-500">{i.name}</p>
                 </div>
                 <div className={`w-2 h-2 rounded-full ${i.status === 'Manual' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
               </button>
             ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Control Schematic */}
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                     <ArrowRightLeft size={24} />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white">{intersection.id} - {intersections[0].name}</h2>
                     <p className="text-xs text-slate-500">Current Phase: {intersection.nsSignal === 'GREEN' ? 'North-South Bound' : 'East-West Bound'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">North-South (Primary)</label>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold font-mono ${intersection.nsSignal === 'GREEN' ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                        {intersection.nsSignal === 'GREEN' ? intersection.timer : 'R'}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Green Duration</span>
                          <span>{intersections[0].nsTime}s</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-slate-800 rounded-full accent-blue-500" defaultValue={intersections[0].nsTime} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">East-West (Secondary)</label>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold font-mono ${intersection.ewSignal === 'GREEN' ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                        {intersection.ewSignal === 'GREEN' ? intersection.timer : 'R'}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Green Duration</span>
                          <span>{intersections[0].ewTime}s</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-slate-800 rounded-full accent-blue-500" defaultValue={intersections[0].ewTime} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Flow Rate</span>
                      <span className="text-sm font-mono font-bold text-emerald-400">842 vehicles/hr</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Pedestrian Demand</span>
                      <span className="text-sm font-mono font-bold text-blue-400">Low</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-bold">AI Optimization</span>
                    <button 
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${aiEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <motion.div 
                        animate={{ x: aiEnabled ? 26 : 4 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 space-y-4">
                <h4 className="font-bold text-sm">Action Queue</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg text-xs border border-slate-700">
                    <Clock size={14} className="text-blue-400" />
                    <span className="flex-1">Next Cycle: 12:44:10</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg text-xs border border-slate-700">
                    <Zap size={14} className="text-emerald-400" />
                    <span className="flex-1">AI Adjust: NS +4s</span>
                  </div>
                  <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase transition-all">
                    Commit Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
             <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
               <div className="flex items-center gap-3">
                 <Sliders size={20} className="text-slate-400" />
                 <h4 className="font-bold">Pattern Override</h4>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 {['Rush Hour', 'Night Mode', 'Event', 'Holiday'].map(m => (
                   <button key={m} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors">
                     {m}
                   </button>
                 ))}
               </div>
             </div>
             <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2">
               <Activity size={32} className="text-emerald-500 animate-pulse" />
               <p className="text-sm font-bold">Signal Health: Optimal</p>
               <p className="text-[10px] text-slate-500">Latency: 42ms • Uptime: 99.9%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalControlView;
