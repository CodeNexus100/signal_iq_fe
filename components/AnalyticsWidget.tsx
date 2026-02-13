
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { time: '08:00', density: 65 },
  { time: '09:00', density: 85 },
  { time: '10:00', density: 70 },
  { time: '11:00', density: 55 },
  { time: '12:00', density: 60 },
  { time: '13:00', density: 75 },
  { time: '14:00', density: 65 },
  { time: '15:00', density: 80 },
];

const AnalyticsWidget: React.FC = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Traffic Density Forecast</h3>
        <select className="bg-slate-800 text-[10px] font-bold uppercase rounded border-none text-slate-400 focus:ring-0">
          <option>Next 8 Hours</option>
          <option>Last 24 Hours</option>
        </select>
      </div>

      <div className="h-[120px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="time" 
              hide={true}
            />
            <YAxis hide={true} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area 
              type="monotone" 
              dataKey="density" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorDensity)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-auto">
        {data.filter((_, i) => i % 2 === 0).map((d) => (
          <span key={d.time} className="text-[10px] font-bold text-slate-500 font-mono">{d.time}</span>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsWidget;
