
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, AlertCircle, Clock, CheckCircle2, Navigation, MapPin, Target, Zap } from 'lucide-react';

const activeIncidents = [
  { id: 'INC-772', type: 'Medical Emergency', unit: 'Ambulance A-202', location: 'Park St & 5th Ave', status: 'Priority 1', eta: '1m 20s', progress: 65 },
  { id: 'INC-781', type: 'Fire Response', unit: 'Engine 42', location: 'Industrial Zone', status: 'En Route', eta: '4m 45s', progress: 30 },
];

const pastIncidents = [
  { id: 'INC-765', type: 'Police Pursuit', unit: 'Unit 9', location: 'Highway 10', resolved: '15m ago', result: 'Cleared' },
  { id: 'INC-760', type: 'Medical Emergency', unit: 'Ambulance B-10', location: 'MG Road', resolved: '42m ago', result: 'Success' },
  { id: 'INC-758', type: 'Traffic Accident', unit: 'Tow 12', location: 'Bridgeside Dr', resolved: '1h 20m ago', result: 'Cleared' },
];

const EmergencyView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(activeIncidents[0].id);

  const selectedIncident = activeIncidents.find(i => i.id === selectedId) || activeIncidents[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl animate-pulse">
            <Siren size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Emergency Response Control</h1>
            <p className="text-slate-400 text-sm">Active priority overrides and incident management</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold uppercase">Avg Response Time</span>
            <span className="text-xl font-mono font-bold text-emerald-400">4m 12s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Incidents List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            Live Incident Queue
          </h3>
          <div className="space-y-4">
            {activeIncidents.map((incident) => (
              <motion.div 
                key={incident.id}
                onClick={() => setSelectedId(incident.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`cursor-pointer transition-all border rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group ${
                  selectedId === incident.id 
                    ? 'bg-slate-800/60 border-red-500/50 ring-1 ring-red-500/20' 
                    : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/40'
                }`}
              >
                {selectedId === incident.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                )}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedId === incident.id ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Navigation size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                          {incident.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">#{incident.id}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{incident.type}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {incident.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">ETA</span>
                    <span className="text-lg font-mono font-bold text-white">{incident.eta}</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${incident.progress}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <h3 className="text-lg font-bold flex items-center gap-2 pt-4">
            <Clock size={20} className="text-slate-500" />
            Response Log
          </h3>
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 divide-y divide-slate-800">
            {pastIncidents.map((incident) => (
              <div key={incident.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-white">{incident.type}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{incident.resolved}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                  <CheckCircle2 size={12} />
                  {incident.result.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Visualizer Panel */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target size={20} className="text-blue-400" />
            Tactical Route Map
          </h3>
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] relative">
            {/* Map Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedIncident.unit} Pathing</h4>
                  <p className="text-[10px] text-slate-400">Real-time SignalIQ Override Enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Clear Channel</span>
              </div>
            </div>

            {/* Simulated Simplified Map Visualization */}
            <div className="flex-1 bg-[#0a0b1e] relative overflow-hidden group">
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', 
                  backgroundSize: '30px 30px' 
                }} 
              />
              
              <svg className="w-full h-full p-10" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Simplified Road Network */}
                <path d="M50 250H450" stroke="#1e293b" strokeWidth="30" strokeLinecap="round" />
                <path d="M250 50V450" stroke="#1e293b" strokeWidth="30" strokeLinecap="round" />
                <path d="M50 100H450" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" opacity="0.5" />
                <path d="M100 50V450" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" opacity="0.5" />
                
                {/* Emergency Route Path (Highlighted) */}
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M50 250H250V50" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  filter="url(#glow)"
                />

                {/* Nodes / Intersections */}
                <circle cx="250" cy="250" r="12" fill="#334155" />
                <circle cx="50" cy="250" r="12" fill="#334155" />
                <circle cx="250" cy="50" r="12" fill="#334155" />

                {/* Destination Marker */}
                <motion.g animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <path d="M250 35L245 45H255L250 35Z" fill="#ef4444" />
                  <circle cx="250" cy="50" r="20" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                </motion.g>

                {/* Vehicle Marker */}
                <motion.circle 
                  animate={{ cx: [50, 250, 250], cy: [250, 250, 50] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  r="8" 
                  fill="#3b82f6" 
                  filter="url(#glow)"
                />

                {/* Signal Interlock Indicators */}
                <circle cx="250" cy="270" r="4" fill="#10b981" />
                <circle cx="250" cy="230" r="4" fill="#10b981" />
                <circle cx="230" cy="250" r="4" fill="#10b981" />
                <circle cx="270" cy="250" r="4" fill="#10b981" />

                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>

              {/* Map Overlays */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl space-y-2 max-w-[200px]">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase">Current Intersection</h5>
                  <p className="text-xs font-bold text-white">Central Hub (I-104)</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-400">Priority Green Locked</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6">
                <div className="flex flex-col gap-2">
                  <button className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Navigation size={18} />
                  </button>
                  <button className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <MapPin size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Routing Stats Footer */}
            <div className="p-4 bg-slate-800/30 grid grid-cols-3 gap-4 border-t border-slate-700/50">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Distance</span>
                <span className="text-sm font-mono font-bold">3.2 km</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Signals Handled</span>
                <span className="text-sm font-mono font-bold text-blue-400">7 / 12</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Risk Index</span>
                <span className="text-sm font-mono font-bold text-emerald-400">Low (0.12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyView;
