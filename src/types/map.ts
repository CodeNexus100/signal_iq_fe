
// Map specific types are defined in the store currently, but could be extracted.
// For now, they are exported from useSimulationStore, but we can re-export or move them.
// Let's create types/map.ts if not exists.
export interface Point {
  x: number;
  y: number;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: 'intersection' | 'endpoint';
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  lanes: number;
  density?: number; // 0.0 - 1.0 (Congestion)
  geometry?: Point[]; // Array of points for rendering curves (Bezier control points or Polyline)
}

export interface MapGraph {
  nodes: MapNode[];
  edges: MapEdge[];
}
