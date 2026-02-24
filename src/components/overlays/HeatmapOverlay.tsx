
import React from 'react';
import { Stage, Layer, Circle, Rect } from 'react-konva';
import { useSimulationStore } from '../../store/useSimulationStore';

// Simple heatmap overlay: renders soft semi-transparent circles over congested nodes/edges
const HeatmapOverlay: React.FC = () => {
  const mapGraph = useSimulationStore(state => state.mapGraph);
  const metrics = useSimulationStore(state => state.metrics);

  // If global congestion is low, maybe hide?
  // For now, visualize specific hotspots if we had per-node congestion data.
  // Since we only have global metrics or edge density (added in Phase 2),
  // let's iterate edges and draw a heat blob if density is high.

  const congestedEdges = mapGraph.edges.filter(e => (e.density || 0) > 0.6);

  if (congestedEdges.length === 0) return null;

  return (
      <Group>
          {congestedEdges.map(edge => {
               // Calculate midpoint for blob
               let x = 0, y = 0;
               if (edge.geometry && edge.geometry.length > 0) {
                   const mid = Math.floor(edge.geometry.length / 2);
                   x = edge.geometry[mid].x;
                   y = edge.geometry[mid].y;
               } else {
                   // Lookup nodes
                   const from = mapGraph.nodes.find(n => n.id === edge.from);
                   const to = mapGraph.nodes.find(n => n.id === edge.to);
                   if (from && to) {
                       x = (from.x + to.x) / 2;
                       y = (from.y + to.y) / 2;
                   }
               }

               const intensity = (edge.density || 0);

               return (
                   <Circle
                        key={`heat-${edge.id}`}
                        x={x}
                        y={y}
                        radius={40 * intensity}
                        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                        fillRadialGradientStartRadius={0}
                        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                        fillRadialGradientEndRadius={40 * intensity}
                        fillRadialGradientColorStops={[0, 'rgba(239, 68, 68, 0.6)', 1, 'rgba(239, 68, 68, 0)']}
                        listening={false}
                   />
               );
          })}
      </Group>
  );
};
// Note: This needs to be included inside the Stage/Layer of GraphMap or overlaid.
// Since GraphMap owns the Stage, we should probably integrate this logic directly into GraphMap
// or make GraphMap accept children layers.
// For simplicity in this refactor, I'll export it and modify GraphMap to use it,
// OR just fold the logic into GraphMap since we are already iterating edges there.
// folding into GraphMap is cleaner for Z-indexing (draw heat *under* or *over* roads).
// Let's actually put it *over* roads but *under* labels?
// Actually, `GraphMap.tsx` is the monolithic renderer now.
// I will skip creating a separate file and integrate the logic into GraphMap in the next step or revisit.
// The Plan said "Create HeatmapOverlay". I should stick to creating the file if I want to be modular.
// But GraphMap needs to import it.

import { Group } from 'react-konva';
export default HeatmapOverlay;
