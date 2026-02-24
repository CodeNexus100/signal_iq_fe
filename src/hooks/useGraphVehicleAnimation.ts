
import { useState, useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { MapEdge } from '../types/map';

// Helper to calculate position on Quadratic Bezier or Linear segment
const getPositionOnEdge = (edge: MapEdge, position: number, totalLength: number = 200) => {
    if (!edge.geometry || edge.geometry.length < 2) return { x: 0, y: 0, rotation: 0 };

    // Normalize progress (0 to 1) based on segment length
    const t = Math.max(0, Math.min(1, position / totalLength));

    if (edge.geometry.length === 3) {
        // Quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const p0 = edge.geometry[0];
        const p1 = edge.geometry[1];
        const p2 = edge.geometry[2];

        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

        // Tangent for rotation: B'(t) = 2(1-t)(P1-P0) + 2t(P2-P1)
        const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
        const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
        const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

        return { x, y, rotation };
    }

    // Linear Fallback
    const p0 = edge.geometry[0];
    const p1 = edge.geometry[edge.geometry.length - 1];

    const x = p0.x + (p1.x - p0.x) * t;
    const y = p0.y + (p1.y - p0.y) * t;
    const rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI);

    return { x, y, rotation };
};

export const useGraphVehicleAnimation = () => {
    const vehicles = useSimulationStore(state => state.vehicles);
    const mapGraph = useSimulationStore(state => state.mapGraph);

    const [displayVehicles, setDisplayVehicles] = useState<any[]>([]);

    // Simple direct mapping for now (60fps animation would need interpolation state)
    useEffect(() => {
        const mapped = vehicles.map(v => {
            // Map global position to edge segment
            const SEGMENT_LENGTH = 200; // Must match Adapter logic
            const segmentIndex = Math.floor(v.position / SEGMENT_LENGTH);
            const localPos = v.position % SEGMENT_LENGTH;

            let targetEdgeId = '';
            // Extract row/col from laneId (e.g. "H0" -> row 0)
            const index = parseInt(v.laneId.replace(/[HV]/, ''), 10);

            if (v.laneType === 'horizontal') {
                targetEdgeId = `H-${index}-${segmentIndex}`;
            } else {
                targetEdgeId = `V-${index}-${segmentIndex}`;
            }

            const edge = mapGraph.edges.find(e => e.id === targetEdgeId);
            if (!edge) return null;

            const { x, y, rotation } = getPositionOnEdge(edge, localPos, SEGMENT_LENGTH);

            return {
                ...v,
                x,
                y,
                rotation
            };
        }).filter(Boolean);

        setDisplayVehicles(mapped);
    }, [vehicles, mapGraph]);

    return displayVehicles;
};
