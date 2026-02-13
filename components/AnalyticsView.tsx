
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Car, Clock, MapPin, Download } from 'lucide-react';

const volumeData = [
  { name: 'Mon', cars: 4000, trucks: 2400, buses: 1200 },
  { name: 'Tue', cars: 3000, trucks: 1398, buses: 1100 },
  { name: 'Wed', cars: 2000, trucks: 9800, buses: 1400 },
  { name: 'Thu', cars: 2780, trucks: 3908, buses: 1500 },
  { name: 'Fri', cars: 1890, trucks: 4800, buses: 1300 },
  { name: 'Sat', cars: 2390, trucks: 3800, buses: 1000 },
  { name: 'Sun', cars: 3490, trucks: 4300, buses: 900 },
];

const peakHourData = [
  { hour: '06:00', load: 30 },
  { hour: '08:00', load: 95 },
  { hour: '10:00', load: 75 },
  { hour: '12:00', load: 60 },
  { hour: '14:00', load: 55 },
  { hour: '16:00', load: 85 },
  { hour: '18:00', load: 98 },
  { hour: '20:00', load: 45 },
];

const vehicleMix = [
  { name: 'Personal Cars', value: 65, color: '#3b82f6' },
  { name: 'Trucks/Freight', value: 20, color: '#475569' },
  { name: 'Public Transit', value: 10, color: '#b45309' },
  { name: 'Emergency', value: 5, color: '#ef4444' },
];

const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Traffic Analytics</h1>
          <p className="text-slate-400 text-sm">System-wide performance metrics and historical trends</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-sm font-semibold">
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Volume */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Car size={20} /></div>
            <h3 className="font-bold">Weekly Traffic Volume by Category</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Bar dataKey="cars" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="trucks" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="buses" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vehicle Mix */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl"
        >
          <h3 className="font-bold mb-6">Vehicle Distribution</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {vehicleMix.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Peak Hour Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="font-bold">Congestion Heat Index (24h)</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHourData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="load" stroke="#10b981" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsView;
