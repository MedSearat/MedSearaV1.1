
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Community from './pages/Community';
import Notes from './pages/Notes';
import SearAI from './pages/SearAI';
import Calculators from './pages/Calculators';
import Profile from './pages/Profile';
import { StorageService } from './services/storageService';
// Added missing User icon to imports
import { Stethoscope, LogIn, Mail, Lock, ShieldCheck, User } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      // Check for user in storage
      const db = JSON.parse(localStorage.getItem('medsearat_db_v1') || '{}');
      if (db.user) {
        setUser(db.user);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        if (!name || !email || !password) throw new Error("Preencha todos os campos");
        const newUser = StorageService.login(email, name);
        setUser(newUser);
      } else {
        if (!email || !password) throw new Error("Preencha email e senha");
        const existingUser = StorageService.login(email, name || email.split('@')[0]);
        setUser(existingUser);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-blue-600"><Stethoscope size={48} /></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <div className="hidden md:flex flex-1 bg-blue-600 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <Stethoscope size={40} />
              <h1 className="text-4xl font-bold tracking-tight">MedSearat</h1>
            </div>
            <h2 className="text-5xl font-black leading-tight mb-6">A evolução digital da sua clínica.</h2>
            <p className="text-blue-100 text-xl max-w-md">Gerencie pacientes, evoluções clínicas e diagnósticos com o poder da inteligência artificial.</p>
          </div>
          <div className="relative z-10 flex gap-8">
             <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} /> HIPAA Compliance</div>
             <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} /> Dados Criptografados</div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-700 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-700">
            <div className="md:hidden flex flex-col items-center mb-10">
              <div className="p-4 bg-blue-600 text-white rounded-2xl mb-4 shadow-xl">
                 <Stethoscope size={40} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">MedSearat</h1>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{isRegistering ? 'Criar sua conta médica' : 'Bem-vindo de volta'}</h2>
              <p className="text-slate-500">{isRegistering ? 'Junte-se a milhares de profissionais de saúde.' : 'Acesse seu painel clínico profissional.'}</p>
            </div>

            <form className="space-y-6" onSubmit={handleAuth}>
              {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">{error}</div>}
              <div className="space-y-4">
                {isRegistering && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="email" placeholder="Email profissional" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="password" placeholder="Sua senha segura" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                <LogIn size={20} /> {isRegistering ? 'Cadastrar Agora' : 'Aceder ao Sistema'}
              </button>
            </form>

            <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Ou continue com</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
              onClick={() => {
                const googleUser = StorageService.login('dr.google@example.com', 'Dr. Google Health', 'https://picsum.photos/seed/google/200');
                setUser(googleUser);
              }}
              className="w-full py-4 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /> Entrar com Google
            </button>

            <p className="text-center text-sm text-slate-500">
              {isRegistering ? 'Já possui uma conta?' : 'Novo por aqui?'} 
              <button onClick={() => setIsRegistering(!isRegistering)} className="ml-1 text-blue-600 font-bold hover:underline">
                {isRegistering ? 'Faça login' : 'Crie sua conta médica'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard patients={StorageService.getPatients()} evolutions={StorageService.getEvolutions('')} notes={StorageService.getNotes()} onAddPatient={() => setActiveTab('patients')} />;
      case 'patients': return <Patients />;
      case 'community': return <Community user={user} />;
      case 'notes': return <Notes />;
      case 'ai': return <SearAI />;
      case 'calculators': return <Calculators />;
      case 'profile': return <Profile user={user} />;
      default: return <Dashboard patients={StorageService.getPatients()} evolutions={[]} notes={StorageService.getNotes()} onAddPatient={() => setActiveTab('patients')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      {renderContent()}
    </Layout>
  );
};

export default App;
