
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KPISection from './components/KPISection';
import TrafficMap2D from './components/TrafficMap2D';
import AIDecisionPanel from './components/AIDecisionPanel';
import SignalControlPanel from './components/SignalControlPanel';
import EmergencyCard from './components/EmergencyCard';
import InfraStatus from './components/InfraStatus';
import AnalyticsWidget from './components/AnalyticsWidget';
import AnalyticsView from './components/AnalyticsView';
import EmergencyView from './components/EmergencyView';
import SignalControlView from './components/SignalControlView';
import InfrastructureView from './components/InfrastructureView';
import LiveMapView from './components/LiveMapView';
import { IntersectionStatus } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isEmergencyActive, setEmergencyActive] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedIntersectionId, setSelectedIntersectionId] = useState('I-101');
  
  // Multi-Intersection Simulation State (5x5 Grid - 25 intersections)
  // Matching the image: 5 roads horizontal, 5 roads vertical = 25 intersections
  const [intersections, setIntersections] = useState<IntersectionStatus[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]); // Using any for now, refine with proper Vehicle type later

  // Fetch grid state from backend
  useEffect(() => {
    const fetchGridState = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/grid/state');
        if (!response.ok) {
           // Fallback or error handling logic here if needed for demo
           return;
        }
        const data = await response.json();
        if (data.intersections) setIntersections(data.intersections);
        if (data.vehicles) setVehicles(data.vehicles);
      } catch (error) {
        console.error("Failed to fetch grid state:", error);
      }
    };

    const interval = setInterval(fetchGridState, 100);
    fetchGridState(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  const selectedInter = intersections.find(i => i.id === selectedIntersectionId) || intersections[0];

  if (intersections.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0b1e] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-mono animate-pulse">Initializing SignalIQ Grid...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <AnalyticsView />;
      case 'Emergency':
        return <EmergencyView />;
      case 'Signal Control':
        return <SignalControlView intersection={selectedInter} aiEnabled={aiEnabled} setAiEnabled={setAiEnabled} />;
      case 'Infrastructure':
        return <InfrastructureView />;
      case 'Live Map':
        return <LiveMapView />;
      case 'Dashboard':
      default:
        return (
          <div className="flex flex-col gap-6">
            <KPISection />
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-[600px]">
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden flex-1 relative group shadow-2xl min-h-[500px]">
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Urban Grid Logic (5x5)</span>
                    <h2 className="text-xl font-bold">SignalIQ Central Command</h2>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <div className="bg-black/60 px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isEmergencyActive ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-xs font-mono uppercase tracking-tighter">System: {isEmergencyActive ? 'Critical' : 'Nominal'}</span>
                      </div>
                  </div>
                  
                  <TrafficMap2D intersections={intersections} vehicles={vehicles} emergencyActive={isEmergencyActive} onIntersectionClick={setSelectedIntersectionId} />
                  
                  <div className="absolute bottom-4 left-4 z-20 flex gap-4 bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Flowing</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span className="text-[10px] uppercase font-bold text-red-400">EMERGENCY ACTIVE</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SignalControlPanel intersection={selectedInter} aiEnabled={aiEnabled} setAiEnabled={setAiEnabled} />
                  <AnalyticsWidget />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <AIDecisionPanel aiEnabled={aiEnabled} onApply={() => setAiEnabled(true)} />
                <EmergencyCard isActive={isEmergencyActive} setActive={setEmergencyActive} />
                <InfraStatus />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0b1e] text-slate-200 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-6 gap-6 custom-scrollbar">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
