
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Layers, Maximize2, MousePointer2, Info, Compass, Shield, Wind } from 'lucide-react';
import { Stage, Layer, Rect, Circle, Line, Group, Text } from 'react-konva';

const LiveMapView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedZone, setSelectedZone] = useState('Central District');

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const intersections = [];
  const spacing = 180;
  const offset = 100;

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      intersections.push({ x: offset + i * spacing, y: offset + j * spacing, id: `I-${100 + i * 4 + j}` });
    }
  }

  const districts = [
    { name: 'Central District', status: 'Optimal', load: 42, color: 'text-emerald-400' },
    { name: 'North Industrial', status: 'Moderate', load: 68, color: 'text-amber-400' },
    { name: 'West Harbor', status: 'Congested', load: 89, color: 'text-red-400' },
    { name: 'East Tech Park', status: 'Optimal', load: 31, color: 'text-emerald-400' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">City-Wide Traffic Grid</h1>
          <p className="text-slate-400 text-sm">Real-time macro-simulation of municipal traffic flow</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1">
            {['Standard', 'Thermal', 'AI Nodes'].map(v => (
              <button 
                key={v}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${v === 'Standard' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors">
            <Layers size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Map Canvas */}
        <div ref={containerRef} className="flex-1 bg-[#0a0b1e] rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
          {dimensions.width > 0 && (
            <Stage width={dimensions.width} height={dimensions.height}>
              <Layer>
                {/* Background Grid */}
                {Array.from({ length: 40 }).map((_, i) => (
                  <Line key={`v-${i}`} points={[i * 40, 0, i * 40, dimensions.height]} stroke="#1e293b" strokeWidth={0.5} opacity={0.2} />
                ))}
                {Array.from({ length: 40 }).map((_, i) => (
                  <Line key={`h-${i}`} points={[0, i * 40, dimensions.width, i * 40]} stroke="#1e293b" strokeWidth={0.5} opacity={0.2} />
                ))}

                {/* Roads */}
                {/* Horizontal */}
                {[0, 1, 2, 3].map(row => (
                  <Line 
                    key={`hr-${row}`} 
                    points={[offset, offset + row * spacing, offset + 3 * spacing, offset + row * spacing]} 
                    stroke="#1e293b" 
                    strokeWidth={12} 
                    lineCap="round"
                  />
                ))}
                {/* Vertical */}
                {[0, 1, 2, 3].map(col => (
                  <Line 
                    key={`vc-${col}`} 
                    points={[offset + col * spacing, offset, offset + col * spacing, offset + 3 * spacing]} 
                    stroke="#1e293b" 
                    strokeWidth={12} 
                    lineCap="round"
                  />
                ))}

                {/* Road Glows (Congestion Level) */}
                {intersections.map((node, idx) => {
                   if (idx % 4 !== 3) { // Draw horizontal glow
                     const load = Math.random();
                     const color = load > 0.8 ? '#ef4444' : load > 0.5 ? '#f59e0b' : '#3b82f6';
                     return (
                        <Line 
                          key={`glow-h-${idx}`} 
                          points={[node.x, node.y, node.x + spacing, node.y]} 
                          stroke={color} 
                          strokeWidth={2} 
                          opacity={0.6}
                          shadowBlur={10}
                          shadowColor={color}
                        />
                     )
                   }
                   return null;
                })}

                {/* Intersections Nodes */}
                {intersections.map(node => (
                  <Group key={node.id}>
                    <Rect 
                      x={node.x - 10} 
                      y={node.y - 10} 
                      width={20} 
                      height={20} 
                      fill="#334155" 
                      cornerRadius={4}
                      shadowBlur={5}
                      stroke="#475569"
                      strokeWidth={1}
                    />
                    <Circle 
                      x={node.x} 
                      y={node.y} 
                      radius={4} 
                      fill={Math.random() > 0.5 ? '#10b981' : '#ef4444'} 
                      shadowBlur={10} 
                      shadowColor="#10b981"
                    />
                  </Group>
                ))}

                {/* Floating Labels */}
                <Text x={offset} y={offset - 30} text="DISTRICT A - CENTRAL" fill="#64748b" fontSize={10} fontStyle="bold" letterSpacing={2} />
                <Text x={offset + 2 * spacing} y={offset - 30} text="DISTRICT B - NORTH" fill="#64748b" fontSize={10} fontStyle="bold" letterSpacing={2} />
              </Layer>
            </Stage>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2">
            <button className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl">
              <Maximize2 size={18} />
            </button>
            <button className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl">
              <Compass size={18} />
            </button>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-3">
             <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[200px]">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Legend</span>
                  <Info size={14} className="text-slate-500" />
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    AI Optimized Flow
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                    Buffer Threshold
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                    Gridlock Risk
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="w-80 flex flex-col gap-6 shrink-0">
          {/* Active Districts */}
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 shadow-xl flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Zone Monitoring</h3>
              <Shield size={16} className="text-blue-400" />
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {districts.map(d => (
                <button 
                  key={d.name}
                  onClick={() => setSelectedZone(d.name)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                    selectedZone === d.name ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-800/40 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{d.name}</span>
                    <span className={`text-[10px] font-bold uppercase ${d.color}`}>{d.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${d.load}%` }}
                        className={`h-full ${d.load > 80 ? 'bg-red-500' : d.load > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{d.load}%</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-2 italic">
               <MousePointer2 size={12} />
               Click a zone for detailed analytics
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 space-y-4 shadow-xl">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Weather Impact</span>
                <Wind size={16} className="text-cyan-400" />
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-xl font-bold">Low (5%)</span>
                <p className="text-[10px] text-slate-400">Visibility: 10km • Precip: 0mm</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMapView;
