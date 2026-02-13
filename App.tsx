
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
  const [intersections, setIntersections] = useState<IntersectionStatus[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: `I-${101 + i}`,
      nsSignal: i % 2 === 0 ? 'GREEN' : 'RED',
      ewSignal: i % 2 === 0 ? 'RED' : 'GREEN',
      timer: 15 + Math.floor(Math.random() * 15),
    }));
  });

  // Global cycle logic for all intersections
  useEffect(() => {
    const interval = setInterval(() => {
      setIntersections(prev => prev.map(inter => {
        // Simple priority logic for emergency: Green-wave on the first column
        const idNum = parseInt(inter.id.split('-')[1]);
        const isPriorityCorridor = (idNum - 101) % 5 === 0;

        if (isEmergencyActive && isPriorityCorridor) {
          return { ...inter, nsSignal: 'GREEN', ewSignal: 'RED', timer: 99 };
        }

        const nextTimer = inter.timer - 1;
        if (nextTimer <= 0) {
          const isNSGreen = inter.nsSignal === 'GREEN';
          const baseTime = aiEnabled ? (Math.random() > 0.5 ? 12 : 28) : 20;
          return {
            ...inter,
            nsSignal: isNSGreen ? 'RED' : 'GREEN',
            ewSignal: isNSGreen ? 'GREEN' : 'RED',
            timer: baseTime,
          };
        }
        return { ...inter, timer: nextTimer };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEmergencyActive, aiEnabled]);

  const selectedInter = intersections.find(i => i.id === selectedIntersectionId) || intersections[0];

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
                  
                  <TrafficMap2D intersections={intersections} emergencyActive={isEmergencyActive} onIntersectionClick={setSelectedIntersectionId} />
                  
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
