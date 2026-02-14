
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group, Text } from 'react-konva';
import { IntersectionStatus, Vehicle, VehicleType, EmergencyVehicle } from '../types';

interface TrafficMap2DProps {
  intersections: IntersectionStatus[];
  vehicles?: Vehicle[];
  emergencyActive: boolean;
  emergencyVehicle?: EmergencyVehicle | null;
  onIntersectionClick: (id: string) => void;
}

import { useVehicleAnimation } from '../hooks/useVehicleAnimation';

const TrafficMap2D: React.FC<TrafficMap2DProps> = ({ intersections, vehicles = [], emergencyActive, emergencyVehicle, onIntersectionClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use interpolated vehicles for display
  const displayVehicles = useVehicleAnimation({
      serverVehicles: vehicles,
      intersections,
      pollInterval: 50
  });

  // Grid constants: 5 roads = 4 blocks = 25 intersections
  const roadWidth = 50; 
  const lanePadding = 10;
  
  const grid = useMemo(() => {
    if (dimensions.width === 0) return { h: [], v: [] };
    // Evenly spaced 5 roads
    const h = [0.15, 0.32, 0.49, 0.66, 0.83].map(p => dimensions.height * p);
    const v = [0.15, 0.32, 0.49, 0.66, 0.83].map(p => dimensions.width * p);
    return { h, v };
  }, [dimensions]);

  const getVehicleLength = (type: VehicleType) => {
    switch (type) {
      case 'truck': return 32;
      case 'bus': return 38;
      case 'emergency': return 26;
      default: return 18;
    }
  };

  const getVehicleWidth = (type: VehicleType) => (type === 'truck' || type === 'bus' ? 12 : 9);


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

  const flashRate = 1; // Static value to replace animation

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
            {displayVehicles.map(v => {
              let vx = 0, vy = 0, rot = 0;
              const roadIdx = parseInt(v.laneId.match(/\d+/)?.[0] || '0');

              if (v.laneType === 'horizontal') {
                vx = v.position;
                const roadY = grid.h[roadIdx];
                // East (Right) -> Bottom Lane. West (Left) -> Top Lane
                vy = v.direction === 'east' ? roadY + lanePadding : roadY - lanePadding;
                rot = v.direction === 'east' ? 0 : 180; // Point Right or Left
              } else {
                vy = v.position;
                const roadX = grid.v[roadIdx];
                // South (Down) -> Right Lane? (Standard Right Hand Drive). 
                // North (Up) -> Left Lane?
                // Let's stick to previous layout: 
                // 'forward' was roadX - lanePadding (Left). 'backward' was roadX + lanePadding (Right).
                // Engine logic: 'south' is increasing Y (Down). 'north' is increasing Y (Up - wait no, Decreasing Y).
                
                // Let's standardise: 
                // South (Down) -> Right side of road (x > roadX).
                // North (Up) -> Left side of road (x < roadX).
                // Wait, logic in Engine says:
                // South (Inc Pos): Moves Down.
                // North (Dec Pos): Moves Up.
                
                // If I want standard layout:
                // Southbound (Down) traffic should be on the LEFT side if UK/India/Japan (LHT) or RIGHT side if US/EU (RHT).
                // Previous code: 'forward' (Down?) was roadX - lanePadding (Left).
                // Let's assume Left-Hand Traffic for now? Or just map it.
                // Let's use:
                // South (Down) -> roadX - lanePadding (Left)
                // North (Up) -> roadX + lanePadding (Right)
                
                vx = v.direction === 'south' ? roadX - lanePadding : roadX + lanePadding;
                rot = v.direction === 'south' ? 90 : -90; // Point Down or Up
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
                        width={vLen + 16} 
                        height={vWid + 16} 
                        offsetX={vLen/2 + 8} 
                        offsetY={vWid/2 + 8}
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
                        offsetY={vWid + 12} 
                        rotation={-rot} 
                      />
                    </Group>
                  )}

                  {/* Vehicle Body Shadow */}
                  <Rect width={vLen} height={vWid} offsetX={vLen/2} offsetY={vWid/2} fill="#000" opacity={0.2} x={1} y={1} cornerRadius={1} />

                   {/* Main Vehicle Body */}
                   <Rect
                     width={vLen}
                     height={vWid}
                     offsetX={vLen / 2}
                     offsetY={vWid / 2}
                     fill={colors[v.type]}
                    cornerRadius={v.type === 'car' ? 3 : 1}
                    stroke={isEmergency ? (flashRate > 0 ? '#ef4444' : '#3b82f6') : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isEmergency ? 2 : 0.5}
                  />

                  {/* Flashing Light Bar for Emergency */}
                  {isEmergency && (
                    <Group>
                      <Rect 
                        width={6} 
                        height={vWid} 
                        offsetX={3} 
                        offsetY={vWid/2} 
                        fill={flashRate > 0 ? '#ef4444' : '#3b82f6'} 
                        opacity={0.9} 
                      />
                    </Group>
                  )}

                  {/* Visual Detail for common vehicles */}
                  {!isEmergency && v.type === 'car' && (
                    <Rect width={vLen/3} height={vWid-2} offsetX={vLen/2-2} offsetY={vWid/2-1} fill="#0f172a" opacity={0.3} cornerRadius={1} />
                  )}
                </Group>
              );
            })}

            {/* Separate Emergency Vehicle Rendering */}
            {emergencyVehicle && emergencyVehicle.active && (() => {
                // Calculate position based on laneId and position (same logic as vehicles)
                let vx = 0, vy = 0, rot = 0;
                const roadIdx = parseInt(emergencyVehicle.laneId.match(/\d+/)?.[0] || '0');
                
                // Determine logic based on H or V lane
                if (emergencyVehicle.laneId.startsWith('H')) {
                   vx = emergencyVehicle.position;
                   const roadY = grid.h[roadIdx];
                   // Assuming default forward for now, or determining based on start/end
                   // With Horizontal Shape (Point Right):
                   // East (H0) -> rot = 0
                   vy = roadY + lanePadding; 
                   rot = 0;
                } else {
                   vy = emergencyVehicle.position;
                   const roadX = grid.v[roadIdx];
                   vx = roadX - lanePadding;
                   // South (Down) -> rot = 90
                   rot = 90;
                }

                return (
                <Group x={vx} y={vy} rotation={rot}>
                    {/* Pulsing Aura */}
                     <Circle 
                        radius={30} 
                        fill={flashRate > 0 ? '#ef4444' : 'transparent'} 
                        opacity={0.3} 
                        shadowBlur={30} 
                        shadowColor="#ef4444"
                     />
                     {/* Vehicle Body (Horizontal Default) */}
                     <Rect 
                        width={28} 
                        height={14} 
                        offsetX={14} 
                        offsetY={7} 
                        fill="#ef4444" 
                        cornerRadius={2}
                        rotation={0} 
                     />
                     {/* Light Bar */}
                     <Rect 
                        width={6} 
                        height={14} 
                        offsetX={-6} 
                        offsetY={7} 
                        fill={flashRate > 0 ? '#ffffff' : '#ef4444'} 
                     />
                     <Text 
                        text="EMERGENCY" 
                        fontSize={10} 
                        fill="#ffffff" 
                        fontStyle="bold"
                        y={-22}
                        offsetX={32}
                        rotation={-rot} // Keep text upright relative to screen if desired, or rotate with vehicle
                     />
                </Group>
                );
            })()}

            {/* Separate Emergency Vehicle Rendering */}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default React.memo(TrafficMap2D);
