
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
  Stethoscope,
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

  const goHome = () => {
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button onClick={goHome} className="flex items-center gap-2">
          <Stethoscope className="text-blue-600" size={28} />
          <h1 className="text-xl font-bold text-slate-800">MedSearat</h1>
        </button>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-40 bg-white border-r transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 w-72 md:min-h-screen flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b">
          <button onClick={goHome} className="flex items-center gap-2">
            <Stethoscope className="text-blue-600" size={32} />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">MedSearat</h1>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Professional</span>
            </div>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-10 overflow-y-auto">
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

        <div className="p-4 border-t bg-slate-50/50">
          <div className="bg-white p-3 rounded-2xl mb-4 border border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Suporte</h4>
            <div className="space-y-2">
              <a href="mailto:medsearat@gmail.com" className="flex items-center px-2 py-1 text-xs text-slate-600 hover:text-blue-600">
                <Mail size={14} className="mr-2" /> medsearat@gmail.com
              </a>
              <a href="https://wa.link/w0msgz" target="_blank" rel="noopener noreferrer" className="flex items-center px-2 py-1 text-xs text-slate-600 hover:text-green-600">
                <MessageCircle size={14} className="mr-2" /> WhatsApp Direto
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mb-4">
            <img 
              src={user?.avatarUrl || `https://picsum.photos/seed/${user?.email}/200`} 
              className="w-10 h-10 rounded-xl object-cover shadow-sm border"
              alt="Avatar"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tight">
                {user?.profession || 'Profissional'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-xs uppercase"
          >
            <LogOut size={16} className="mr-3" /> Encerrar Sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
