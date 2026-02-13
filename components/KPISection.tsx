
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crosshair, Clock, Zap } from 'lucide-react';

const KPISection: React.FC = () => {
  const kpis = [
    { label: 'Live Traffic Density', value: '42%', trend: '+4.2%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Intersections', value: '1,284', trend: 'Nominal', icon: Crosshair, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Emergency Resp. Time', value: '4m 12s', trend: '-12%', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'AI Optimization Efficiency', value: '+34.5%', trend: 'Optimized', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-slate-600 transition-colors group cursor-default"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{kpi.value}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                kpi.trend.startsWith('-') ? 'text-emerald-400 bg-emerald-400/10' : 
                kpi.trend === 'Nominal' || kpi.trend === 'Optimized' ? 'text-blue-400 bg-blue-400/10' :
                'text-red-400 bg-red-400/10'
              }`}>
                {kpi.trend}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} shadow-lg shadow-black/5 flex items-center justify-center transition-transform group-hover:scale-110`}>
            <kpi.icon size={24} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KPISection;
