
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle, Group, Text, Rect } from 'react-konva';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useGraphVehicleAnimation } from '../../hooks/useGraphVehicleAnimation';
import { Vehicle } from '../../../types';

const GraphMap: React.FC = () => {
  const mapGraph = useSimulationStore(state => state.mapGraph);
  const intersections = useSimulationStore(state => state.intersections);
  const setSelectedIntersectionId = useSimulationStore(state => state.setSelectedIntersectionId);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook to get vehicle positions
  const vehicles = useGraphVehicleAnimation();

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

  // Viewport Transform (Simple scaling to fit graph in view)
  const getTransform = () => {
      if (mapGraph.nodes.length === 0) return { scale: 1, offsetX: 0, offsetY: 0 };

      const xs = mapGraph.nodes.map(n => n.x);
      const ys = mapGraph.nodes.map(n => n.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      const scaleX = (dimensions.width - 100) / graphWidth;
      const scaleY = (dimensions.height - 100) / graphHeight;
      const scale = Math.min(scaleX, scaleY);

      return {
          scale,
          offsetX: -minX * scale + (dimensions.width - graphWidth * scale) / 2,
          offsetY: -minY * scale + (dimensions.height - graphHeight * scale) / 2
      };
  };

  const transform = getTransform();

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0b1e]">
       {dimensions.width > 0 && mapGraph.nodes.length > 0 && (
           <Stage width={dimensions.width} height={dimensions.height}>
               <Layer>
                   <Group x={transform.offsetX} y={transform.offsetY} scaleX={transform.scale} scaleY={transform.scale}>

                       {/* Edges (Roads) */}
                       {mapGraph.edges.map(edge => {
                           let points: number[] = [];
                           if (edge.geometry && edge.geometry.length === 3) {
                               points = [
                                   edge.geometry[0].x, edge.geometry[0].y,
                                   edge.geometry[1].x, edge.geometry[1].y,
                                   edge.geometry[2].x, edge.geometry[2].y
                               ];
                           } else {
                               // Fallback straight line
                               const from = mapGraph.nodes.find(n => n.id === edge.from);
                               const to = mapGraph.nodes.find(n => n.id === edge.to);
                               if (from && to) points = [from.x, from.y, to.x, to.y];
                           }

                           return (
                               <Group key={edge.id}>
                                   {/* Road Base */}
                                   <Line
                                       points={points}
                                       stroke="#1e293b"
                                       strokeWidth={20}
                                       lineCap="round"
                                       lineJoin="round"
                                       tension={0.5}
                                   />
                                   {/* Lane Markings */}
                                   <Line
                                       points={points}
                                       stroke="#334155"
                                       strokeWidth={1}
                                       dash={[10, 10]}
                                       tension={0.5}
                                   />
                               </Group>
                           );
                       })}

                       {/* Nodes (Intersections) */}
                       {mapGraph.nodes.map(node => {
                           const status = intersections[node.id];
                           return (
                               <Group
                                    key={node.id}
                                    x={node.x}
                                    y={node.y}
                                    onClick={() => setSelectedIntersectionId(node.id)}
                                    onTap={() => setSelectedIntersectionId(node.id)}
                                    cursor="pointer"
                               >
                                   <Circle radius={15} fill="#1e293b" stroke="#475569" strokeWidth={2} />

                                   {/* Signals Status Overlay */}
                                   {status && (
                                       <>
                                        {/* NS Signal */}
                                        <Circle y={-20} radius={4} fill={status.nsSignal === 'GREEN' ? '#10b981' : '#ef4444'} />
                                        {/* EW Signal */}
                                        <Circle x={20} radius={4} fill={status.ewSignal === 'GREEN' ? '#10b981' : '#ef4444'} />
                                       </>
                                   )}

                                   <Text
                                       text={node.id.split('-')[1]}
                                       fill="#94a3b8"
                                       fontSize={10}
                                       offsetX={10}
                                       offsetY={5}
                                   />
                               </Group>
                           );
                       })}

                        {/* Vehicles */}
                        {vehicles.map((v: Vehicle & { x: number, y: number, rotation: number }) => (
                            <Group key={v.id} x={v.x} y={v.y} rotation={v.rotation}>
                                {/* Vehicle Body */}
                                <Rect
                                    width={16}
                                    height={8}
                                    offsetX={8}
                                    offsetY={4}
                                    fill={v.type === 'emergency' ? '#ef4444' : '#3b82f6'}
                                    cornerRadius={2}
                                />
                                {v.type === 'emergency' && (
                                     <Rect
                                        width={4}
                                        height={8}
                                        offsetX={0}
                                        offsetY={4}
                                        fill="#fff"
                                        opacity={0.8}
                                     />
                                )}
                            </Group>
                        ))}
                   </Group>
               </Layer>
           </Stage>
       )}
    </div>
  );
};

export default GraphMap;
