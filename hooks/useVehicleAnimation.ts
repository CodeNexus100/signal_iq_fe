
import { useState, useEffect, useRef } from 'react';
import { Vehicle, IntersectionStatus } from '../types';

// Constants matching backend config
const INTERSECTION_SPACING = 100;
const STOP_OFFSET = 35; // Visual distance from intersection center to stop line

interface VehicleAnimationProps {
    serverVehicles: Vehicle[];
    intersections: IntersectionStatus[];
    pollInterval: number; // e.g. 50ms
}

export const useVehicleAnimation = ({
    serverVehicles,
    intersections,
    pollInterval
}: VehicleAnimationProps) => {
    const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>(serverVehicles);

    // Ref to hold the latest server state to avoid stale closures in loop
    const targetVehiclesRef = useRef<Vehicle[]>(serverVehicles);
    // Ref to hold the previous frame's state for interpolation start
    const startVehiclesRef = useRef<Map<string, { pos: number, time: number }>>(new Map());
    // Ref to track last update time
    const lastUpdateRef = useRef<number>(Date.now());

    // Update refs when server data changes
    useEffect(() => {
        lastUpdateRef.current = Date.now();

        // Snapshot current display state as the new "Start" state for existing vehicles
        const newStartMap = new Map<string, { pos: number, time: number }>();

        // We use the *current interpolated* state as the start, not the old server state, 
        // to prevent jumping if we haven't reached the target yet.
        displayVehicles.forEach(v => {
            newStartMap.set(v.id, { pos: v.position, time: Date.now() });
        });

        serverVehicles.forEach(v => {
            // If it's a new vehicle not in display, start at its server pos
            if (!newStartMap.has(v.id)) {
                newStartMap.set(v.id, { pos: v.position, time: Date.now() });
            }
        });

        startVehiclesRef.current = newStartMap;
        targetVehiclesRef.current = serverVehicles;

    }, [serverVehicles]); // Intentionally dep on serverVehicles content change

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - lastUpdateRef.current;
            // Calculate progress (0.0 to 1.0). Limit to 1.0 to avoid overshooting too much if laggy.
            // We allow slight overshoot (1.2) to predict movement if server lags, but better to clamp for now.
            const progress = Math.min(elapsed / pollInterval, 1.0);

            const interpolated = targetVehiclesRef.current.map(targetV => {
                const startData = startVehiclesRef.current.get(targetV.id);

                let newPos = targetV.position;

                if (startData) {
                    // Linear Interpolation
                    const delta = targetV.position - startData.pos;

                    // Handle wrapping or respawn? 
                    // If delta is huge (respawn), don't interpolate, just jump.
                    if (Math.abs(delta) > 100) {
                        newPos = targetV.position;
                    } else {
                        newPos = startData.pos + (delta * progress);
                    }
                }

                // --- Red Light Enforcer ---
                // Visually clamp position if approaching a red light
                // This is strictly visual to prevent "running the light" artifacts
                const constrainedPos = enforceRedLight(targetV, newPos, intersections);

                return {
                    ...targetV,
                    position: constrainedPos
                };
            });

            setDisplayVehicles(interpolated);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [intersections, pollInterval]); // Re-create loop if config changes, but Refs handle vehicle data

    return displayVehicles;
};

// Helper: Check if vehicle visual position should be clamped
const enforceRedLight = (v: Vehicle, currentPos: number, intersections: IntersectionStatus[]): number => {
    // Determine lane index and type
    let laneIdx = 0;
    try {
        laneIdx = parseInt(v.laneId.slice(1));
    } catch { return currentPos; }

    const isHorizontal = v.laneType === 'horizontal';

    // Find upcoming intersection
    // Logic similar to backend but simplified for specific visual checking
    for (let i = 0; i < 5; i++) {
        const intersectionPos = i * INTERSECTION_SPACING;
        const intersectionId = isHorizontal
            ? `I-${100 + (laneIdx * 5) + i + 1}`
            : `I-${100 + (i * 5) + laneIdx + 1}`;

        const intersection = intersections.find(int => int.id === intersectionId);
        if (!intersection) continue;

        // Check Signal Status
        const signal = isHorizontal ? intersection.ewSignal : intersection.nsSignal;
        if (signal === 'GREEN') continue;

        // Check if we are approaching valid stop line
        let stopLine = -1;
        let isApproaching = false;

        // Eastbound (Increasing X) or Southbound (Increasing Y)
        if (v.direction === 'east' || v.direction === 'south') {
            stopLine = intersectionPos - STOP_OFFSET;
            // If we are BEFORE the stop line (or slightly past due to lag)
            if (currentPos < stopLine + 5 && currentPos > stopLine - 50) {
                isApproaching = true;
            }

            if (isApproaching && currentPos > stopLine) {
                return stopLine; // CLAMP
            }
        }
        // Westbound (Decreasing X) or Northbound (Decreasing Y)
        else {
            stopLine = intersectionPos + STOP_OFFSET;
            if (currentPos > stopLine - 5 && currentPos < stopLine + 50) {
                isApproaching = true;
            }

            if (isApproaching && currentPos < stopLine) {
                return stopLine; // CLAMP
            }
        }
    }

    return currentPos;
};
