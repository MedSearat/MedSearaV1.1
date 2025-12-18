
import React from 'react';
import { Users, FileText, Activity, MessageSquare, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  patients: any[];
  evolutions: any[];
  notes: any[];
  communityPosts: any[];
  onAddPatient: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, evolutions, notes, communityPosts, onAddPatient }) => {
  const stats = [
    { label: 'Pacientes', value: patients.length, icon: <Users className="text-blue-600" />, set: 'pacientes' },
    { label: 'Atendimentos', value: evolutions.length, icon: <Activity className="text-green-600" />, color: 'bg-green-100' },
    { label: 'Notas', value: notes.length, icon: <FileText className="text-amber-600" />, color: 'bg-amber-100' },
    { label: 'Comunidade', value: communityPosts.length, icon: <MessageSquare className="text-purple-600" />, color: 'bg-purple-100' },
  ];

  // Dummy chart data - Could be replaced with real evolution data over time
  const data = [
    { name: 'Seg', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 1).length || 0 },
    { name: 'Ter', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 2).length || 0 },
    { name: 'Qua', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 3).length || 0 },
    { name: 'Qui', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 4).length || 0 },
    { name: 'Sex', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 5).length || 0 },
    { name: 'Sab', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 6).length || 0 },
    { name: 'Dom', atendimentos: evolutions.filter(e => new Date(e.date).getDay() === 0).length || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Resumo Operacional</h1>
          <p className="text-slate-500">Bem-vindo ao MedSearat. Aqui estão os dados reais da sua clínica.</p>
        </div>
        <button 
          onClick={onAddPatient}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Novo Atendimento
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color || 'bg-blue-100'}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Atendimentos na Semana</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAtend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="atendimentos" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAtend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pacientes Recentes</h3>
          <div className="space-y-4">
            {patients.length > 0 ? (
              patients.slice(0, 5).reverse().map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.consultationDate}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">Nenhum paciente ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
