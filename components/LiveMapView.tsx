
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Layers, Maximize2, MousePointer2, Info, Compass, Shield, Wind } from 'lucide-react';
import { Stage, Layer, Rect, Circle, Line, Group, Text } from 'react-konva';
import { GridOverview, RoadOverview } from '../types';

const LiveMapView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedZone, setSelectedZone] = useState('Central District');
  const [gridOverview, setGridOverview] = useState<GridOverview | null>(null);

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

  // Poll Backend
  useEffect(() => {
    const fetchOverview = async () => {
        try {
            const res = await fetch('http://localhost:8001/api/grid/overview');
            if (res.ok) {
                const data = await res.json();
                setGridOverview(data);
            }
        } catch (e) {
            console.error("Failed to fetch grid overview", e);
        }
    };

    fetchOverview(); // Initial
    const interval = setInterval(fetchOverview, 500);
    return () => clearInterval(interval);
  }, []);

  // Generate 5x5 Grid Nodes (25 nodes)
  // Dynamic scaling
  const padding = 60;
  const availableSize = Math.min(dimensions.width, dimensions.height) - (padding * 2);
  const spacing = availableSize / 4; // 4 segments for 5 points
  
  const offsetX = (dimensions.width - availableSize) / 2;
  const offsetY = (dimensions.height - availableSize) / 2;

  const intersections = [];
  
  if (dimensions.width > 0) {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            // i = col, j = row
          intersections.push({ 
              x: offsetX + i * spacing, 
              y: offsetY + j * spacing, 
              id: `I-${101 + j * 5 + i}`,
              row: j,
              col: i
          });
        }
      }
  }

  const getRoadColor = (laneId: string) => {
      if (!gridOverview) return '#3b82f6'; // Default Blue
      const road = gridOverview.roads.find(r => r.laneId === laneId);
      if (!road) return '#3b82f6';
      
      if (road.congestion > 0.75) return '#ef4444'; // Red
      if (road.congestion > 0.5) return '#f59e0b'; // Yellow
      return '#3b82f6'; // Blue
  };
  
  const getRoadWidth = (laneId: string) => {
       if (!gridOverview) return 12;
       const road = gridOverview.roads.find(r => r.laneId === laneId);
       // Thicker if congested?
       return road && road.congestion > 0.5 ? 14 : 12;
  };
  
  const getZoneColor = (status: string) => {
      switch(status.toLowerCase()) {
          case 'congested': return 'text-red-400';
          case 'moderate': return 'text-amber-400';
          default: return 'text-emerald-400';
      }
  };

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

                {/* Roads 5x5 Grid */}
                {/* Horizontal Rows (H0 - H4) */}
                {[0, 1, 2, 3, 4].map(row => {
                  const color = getRoadColor(`H${row}`);
                  return (
                    <Group key={`hr-group-${row}`}>
                         {/* Base Road */}
                         <Line 
                            points={[offsetX, offsetY + row * spacing, offsetX + 4 * spacing, offsetY + row * spacing]} 
                            stroke="#1e293b" 
                            strokeWidth={getRoadWidth(`H${row}`) + 4} 
                            lineCap="round"
                          />
                          {/* Active Color */}
                          <Line 
                            points={[offsetX, offsetY + row * spacing, offsetX + 4 * spacing, offsetY + row * spacing]} 
                            stroke={color} 
                            strokeWidth={getRoadWidth(`H${row}`)} 
                            lineCap="round"
                            opacity={0.8}
                            shadowBlur={color === '#3b82f6' ? 0 : 15}
                            shadowColor={color}
                          />
                    </Group>
                  );
                })}

                {/* Vertical Cols (V0 - V4) */}
                {[0, 1, 2, 3, 4].map(col => {
                  const color = getRoadColor(`V${col}`);
                  return (
                     <Group key={`vc-group-${col}`}>
                         <Line 
                            points={[offsetX + col * spacing, offsetY, offsetX + col * spacing, offsetY + 4 * spacing]} 
                            stroke="#1e293b" 
                            strokeWidth={getRoadWidth(`V${col}`) + 4} 
                            lineCap="round"
                          />
                          <Line 
                            points={[offsetX + col * spacing, offsetY, offsetX + col * spacing, offsetY + 4 * spacing]} 
                            stroke={color} 
                            strokeWidth={getRoadWidth(`V${col}`)} 
                            lineCap="round"
                            opacity={0.8}
                            shadowBlur={color === '#3b82f6' ? 0 : 15}
                            shadowColor={color}
                          />
                     </Group>
                  );
                })}

                {/* Intersections Nodes */}
                {intersections.map(node => (
                  <Group key={node.id}>
                    <Rect 
                      x={node.x - 8} 
                      y={node.y - 8} 
                      width={16} 
                      height={16} 
                      fill="#1e293b" 
                      cornerRadius={4}
                      stroke="#475569"
                      strokeWidth={1}
                    />
                    <Circle 
                      x={node.x} 
                      y={node.y} 
                      radius={3} 
                      fill="#64748b" 
                    />
                  </Group>
                ))}

                {/* Floating Labels */}
                <Text x={offsetX} y={offsetY - 30} text="NORTH ZONE" fill="#64748b" fontSize={10} fontStyle="bold" letterSpacing={2} />
                <Text x={offsetX + 4 * spacing - 40} y={offsetY - 30} text="SOUTH ZONE" fill="#64748b" fontSize={10} fontStyle="bold" letterSpacing={2} />
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

          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
             <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[200px]">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Traffic Flow</span>
                  <Info size={14} className="text-slate-500" />
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    Free Flow
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                    Moderate Load
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                    Congested
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
              {gridOverview?.zones.map(d => (
                <button 
                  key={d.name}
                  onClick={() => setSelectedZone(d.name)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                    selectedZone === d.name ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-800/40 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{d.name}</span>
                    <span className={`text-[10px] font-bold uppercase ${getZoneColor(d.status)}`}>{d.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${d.load * 100}%` }}
                        className={`h-full ${d.load > 0.8 ? 'bg-red-500' : d.load > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{Math.round(d.load * 100)}%</span>
                  </div>
                </button>
              ))}
              
              {!gridOverview && (
                  <div className="text-center text-slate-500 text-xs py-10 animate-pulse">
                      loading zone data...
                  </div>
              )}
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
