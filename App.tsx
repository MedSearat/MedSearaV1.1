
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Community from './pages/Community';
import Notes from './pages/Notes';
import SearAI from './pages/SearAI';
import Calculators from './pages/Calculators';
import Profile from './pages/Profile';
import { StorageService } from './services/storageService';
import { supabase } from './services/supabase';
import { Stethoscope, ShieldCheck, User, Lock, Mail, AlertTriangle, Loader2, Database, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    evolutions: [],
    notes: [],
    posts: []
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const [patients, evolutions, notes, posts] = await Promise.all([
        StorageService.getPatients(),
        StorageService.getAllEvolutions(),
        StorageService.getNotes(),
        StorageService.getPosts()
      ]);
      setDashboardData({ patients, evolutions, notes, posts });
    } catch (e) {
      console.error("Erro ao sincronizar dados:", e);
    }
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        StorageService.getCurrentUser().then(setUser);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        StorageService.getCurrentUser().then(setUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) refreshData();
  }, [user, refreshData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { full_name: fullName } 
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (data.user) {
          setSuccess("Registro concluído! Acesso imediato liberado.");
          setIsRegistering(false);
          if (!data.session) {
             await supabase.auth.signInWithPassword({ email, password });
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && !user) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse">MedSearat está carregando...</p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-white p-2 rounded-xl text-blue-600">
                <Stethoscope size={32} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white">MedSearat</h1>
            </div>
            <h2 className="text-6xl font-black leading-tight tracking-tight mb-8">Gestão Médica <br /><span className="text-blue-200">Totalmente Segura.</span></h2>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md inline-flex self-start">
                <ShieldCheck size={24} className="text-blue-200" />
                <span className="font-semibold text-white">Proteção de Dados Sensíveis</span>
              </div>
               <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md inline-flex self-start">
                <Database size={24} className="text-blue-200" />
                <span className="font-semibold text-white">Prontuários Sincronizados</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/30">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="flex flex-col items-center mb-6">
                 <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-2xl shadow-blue-200">
                    <Stethoscope size={48} />
                 </div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">MedSearat</h2>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Plataforma Médica Integrada</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 text-green-700 text-xs rounded-2xl border border-green-100 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-6">
              <form className="space-y-4" onSubmit={handleAuth}>
                {isRegistering && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input type="text" placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all" required />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all" required />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all" required />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 active:scale-[0.98]">
                  {loading ? 'Processando...' : (isRegistering ? 'Criar Registro' : 'Entrar no Sistema')}
                </button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Autenticação Segura</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 border border-slate-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Entrar com Google
              </button>

              <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }} className="w-full text-center text-xs text-slate-500 font-bold hover:text-blue-600 transition-colors">
                {isRegistering ? 'Já possui conta? Fazer Login' : 'Ainda não é cadastrado? Criar Registro'}
              </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-medium px-8">
              Ao continuar, você concorda com os termos de segurança e privacidade do MedSearat para gestão de dados médicos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            patients={dashboardData.patients} 
            evolutions={dashboardData.evolutions} 
            notes={dashboardData.notes} 
            communityPosts={dashboardData.posts}
            onAddPatient={() => setActiveTab('patients')} 
          />
        )}
        {activeTab === 'patients' && <Patients />}
        {activeTab === 'community' && <Community user={user} />}
        {activeTab === 'notes' && <Notes />}
        {activeTab === 'ai' && <SearAI />}
        {activeTab === 'calculators' && <Calculators />}
        {activeTab === 'profile' && <Profile user={user} />}
      </Suspense>
    </Layout>
  );
};

export default App;
