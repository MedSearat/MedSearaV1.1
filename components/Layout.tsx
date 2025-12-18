
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  StickyNote, 
  BrainCircuit, 
  Calculator, 
  UserCircle, 
  LogOut, 
  Menu, 
  X,
  PlusCircle,
  Stethoscope,
  Heart,
  Mail,
  MessageCircle,
  Home
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    StorageService.logout();
    window.location.reload();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'patients', label: 'Pacientes', icon: <Users size={20} /> },
    { id: 'community', label: 'Comunidade', icon: <MessageSquare size={20} /> },
    { id: 'notes', label: 'Bloco de Notas', icon: <StickyNote size={20} /> },
    { id: 'ai', label: 'Sear AI', icon: <BrainCircuit size={20} /> },
    { id: 'calculators', label: 'Calculadoras', icon: <Calculator size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <Stethoscope className="text-blue-600" size={28} />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">MedSearat</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Dashboard Shortcut on Mobile Header */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
          >
            <Home size={22} />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-white border-r transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 w-64 md:min-h-screen flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-2 border-b">
          <Stethoscope className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MedSearat</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          <div className="px-4 mb-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu Principal</h4>
          </div>
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="p-4 border-t mt-auto">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
            <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">Suporte Direto</h4>
            <div className="space-y-2">
              <a href="mailto:medsearat@gmail.com" className="flex items-center text-xs text-blue-700 hover:text-blue-900 transition-colors">
                <Mail size={14} className="mr-2" /> medsearat@gmail.com
              </a>
              <a href="https://wa.link/w0msgz" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-700 hover:text-green-600 transition-colors">
                <MessageCircle size={14} className="mr-2" /> WhatsApp Suporte
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mb-4">
            <img 
              src={user?.avatarUrl || `https://picsum.photos/seed/${user?.email}/200`} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
              alt="Avatar"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tight">Médico Assistente</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide"
          >
            <LogOut size={16} className="mr-3" /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Background Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
