
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group, Text } from 'react-konva';
import { IntersectionStatus, Vehicle, VehicleType } from '../types';

interface TrafficMap2DProps {
  intersections: IntersectionStatus[];
  vehicles?: Vehicle[];
  emergencyActive: boolean;
  onIntersectionClick: (id: string) => void;
}

const TrafficMap2D: React.FC<TrafficMap2DProps> = ({ intersections, vehicles = [], emergencyActive, onIntersectionClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tick, setTick] = useState(0);

  // Grid constants: 5 roads = 4 blocks = 25 intersections
  const roadWidth = 50; 
  const lanePadding = 10;
  
  const getGrid = () => {
    if (dimensions.width === 0) return { h: [], v: [] };
    // Evenly spaced 5 roads
    const h = [0.15, 0.32, 0.49, 0.66, 0.83].map(p => dimensions.height * p);
    const v = [0.15, 0.32, 0.49, 0.66, 0.83].map(p => dimensions.width * p);
    return { h, v };
  };

  const getVehicleLength = (type: VehicleType) => {
    switch (type) {
      case 'truck': return 32;
      case 'bus': return 38;
      case 'emergency': return 26;
      default: return 18;
    }
  };

  const getVehicleWidth = (type: VehicleType) => (type === 'truck' || type === 'bus' ? 12 : 9);

  // Animation loop just for visual effects (flashing lights), not physics
  useEffect(() => {
    const animation = setInterval(() => {
      setTick(t => (t + 1) % 1000);
    }, 16);
    return () => clearInterval(animation);
  }, []);

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

  const grid = getGrid();
  const flashRate = Math.sin(tick * 0.2);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0b1e]">
      {dimensions.width > 0 && (
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer>
            {/* 5x5 Grid Road Backgrounds */}
            {grid.h.map((y, idx) => (
              <Group key={`h-road-${idx}`}>
                <Rect x={0} y={y - roadWidth / 2} width={dimensions.width} height={roadWidth} fill="#111827" />
                <Line points={[0, y, dimensions.width, y]} stroke="#1e293b" strokeWidth={1} dash={[12, 12]} opacity={0.5} />
              </Group>
            ))}
            {grid.v.map((x, idx) => (
              <Group key={`v-road-${idx}`}>
                <Rect x={x - roadWidth / 2} y={0} width={roadWidth} height={dimensions.height} fill="#111827" />
                <Line points={[x, 0, x, dimensions.height]} stroke="#1e293b" strokeWidth={1} dash={[12, 12]} opacity={0.5} />
              </Group>
            ))}

            {/* Intersections and Signals */}
            {intersections.map((inter, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5;
              const x = grid.v[col];
              const y = grid.h[row];

              return (
                <Group key={inter.id} onClick={() => onIntersectionClick(inter.id)} cursor="pointer">
                  {/* Visual intersection hub */}
                  <Rect x={x - roadWidth / 2} y={y - roadWidth / 2} width={roadWidth} height={roadWidth} fill="#1a1c3a" />
                  
                  {/* Dynamic Signal Bulbs */}
                  {/* Vertical Direction Signals */}
                  <Circle x={x} y={y - roadWidth/2 - 5} radius={4.5} fill={inter.nsSignal === 'GREEN' ? '#10b981' : '#ef4444'} shadowBlur={inter.nsSignal === 'GREEN' ? 12 : 5} shadowColor={inter.nsSignal === 'GREEN' ? '#10b981' : '#ef4444'} />
                  <Circle x={x} y={y + roadWidth/2 + 5} radius={4.5} fill={inter.nsSignal === 'GREEN' ? '#10b981' : '#ef4444'} shadowBlur={inter.nsSignal === 'GREEN' ? 12 : 5} shadowColor={inter.nsSignal === 'GREEN' ? '#10b981' : '#ef4444'} />
                  
                  {/* Horizontal Direction Signals */}
                  <Circle x={x - roadWidth/2 - 5} y={y} radius={4.5} fill={inter.ewSignal === 'GREEN' ? '#10b981' : '#ef4444'} shadowBlur={inter.ewSignal === 'GREEN' ? 12 : 5} shadowColor={inter.ewSignal === 'GREEN' ? '#10b981' : '#ef4444'} />
                  <Circle x={x + roadWidth/2 + 5} y={y} radius={4.5} fill={inter.ewSignal === 'GREEN' ? '#10b981' : '#ef4444'} shadowBlur={inter.ewSignal === 'GREEN' ? 12 : 5} shadowColor={inter.ewSignal === 'GREEN' ? '#10b981' : '#ef4444'} />
                  
                  <Text x={x - 12} y={y - 5} text={inter.id.split('-')[1]} fill="#475569" fontSize={8} opacity={0.4} />
                </Group>
              );
            })}

            {/* Vehicle Layer */}
            {vehicles.map(v => {
              let vx = 0, vy = 0, rot = 0;
              const roadIdx = parseInt(v.laneId.match(/\d+/)?.[0] || '0');

              if (v.laneType === 'horizontal') {
                vx = v.position;
                const roadY = grid.h[roadIdx];
                vy = v.direction === 'forward' ? roadY + lanePadding : roadY - lanePadding;
                rot = v.direction === 'forward' ? -90 : 90;
              } else {
                vy = v.position;
                const roadX = grid.v[roadIdx];
                vx = v.direction === 'forward' ? roadX - lanePadding : roadX + lanePadding;
                rot = v.direction === 'forward' ? 0 : 180;
              }

              const isEmergency = v.type === 'emergency';
              const colors = { car: '#3b82f6', truck: '#475569', bus: '#f59e0b', emergency: '#ffffff' };
              const vLen = getVehicleLength(v.type);
              const vWid = getVehicleWidth(v.type);

              return (
                <Group key={v.id} x={vx} y={vy} rotation={rot}>
                  {/* Emergency Aura / Markings */}
                  {isEmergency && (
                    <Group>
                      {/* Pulsating Halo */}
                      <Rect 
                        width={vWid + 16} 
                        height={vLen + 16} 
                        offsetX={vWid/2 + 8} 
                        offsetY={vLen/2 + 8}
                        fill={flashRate > 0 ? '#ef4444' : '#3b82f6'} 
                        opacity={0.15}
                        cornerRadius={4}
                        shadowBlur={20}
                        shadowColor={flashRate > 0 ? '#ef4444' : '#3b82f6'}
                      />
                      {/* Emergency Label */}
                      <Text 
                        text="EMG" 
                        fill={flashRate > 0 ? '#ef4444' : '#3b82f6'} 
                        fontSize={10} 
                        fontStyle="bold" 
                        offsetX={10} 
                        offsetY={vLen + 12} 
                        rotation={-rot} 
                      />
                    </Group>
                  )}

                  {/* Vehicle Body Shadow */}
                  <Rect width={vWid} height={vLen} offsetX={vWid/2} offsetY={vLen/2} fill="#000" opacity={0.2} x={1} y={1} cornerRadius={1} />

                  {/* Main Vehicle Body */}
                  <Rect
                    width={vWid}
                    height={vLen}
                    offsetX={vWid / 2}
                    offsetY={vLen / 2}
                    fill={colors[v.type]}
                    cornerRadius={v.type === 'car' ? 3 : 1}
                    stroke={isEmergency ? (flashRate > 0 ? '#ef4444' : '#3b82f6') : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isEmergency ? 2 : 0.5}
                  />

                  {/* Flashing Light Bar for Emergency */}
                  {isEmergency && (
                    <Group>
                      <Rect 
                        width={vWid} 
                        height={6} 
                        offsetX={vWid/2} 
                        offsetY={3} 
                        fill={flashRate > 0 ? '#ef4444' : '#3b82f6'} 
                        opacity={0.9} 
                      />
                    </Group>
                  )}

                  {/* Visual Detail for common vehicles */}
                  {!isEmergency && v.type === 'car' && (
                    <Rect width={vWid-2} height={vLen/3} offsetX={vWid/2-1} offsetY={vLen/2-2} fill="#0f172a" opacity={0.3} cornerRadius={1} />
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default TrafficMap2D;
