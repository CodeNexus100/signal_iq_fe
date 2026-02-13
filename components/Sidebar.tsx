
import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Activity, 
  AlertTriangle, 
  Settings, 
  BarChart3, 
  Cpu,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Live Map', icon: MapIcon },
    { name: 'Signal Control', icon: Activity },
    { name: 'Emergency', icon: AlertTriangle },
    { name: 'Infrastructure', icon: Cpu },
    { name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white">SmartFlow AI</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">SignalIQ System</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              activeTab === item.name 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon size={20} className={activeTab === item.name ? 'text-white' : 'group-hover:text-blue-400'} />
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
          <img 
            src="https://picsum.photos/id/64/100/100" 
            alt="Admin" 
            className="w-10 h-10 rounded-full border-2 border-blue-500/30"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-white">Cmdr. Stark</span>
            <span className="text-[10px] uppercase text-slate-500 font-bold">Traffic Authority</span>
          </div>
          <button className="ml-auto p-1 text-slate-500 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
