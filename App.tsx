
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
import { Stethoscope, LogIn, ShieldCheck, User, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';

// Fallback de erro simples
const ErrorFallback = ({ message }: { message: string }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-red-50 p-8 text-center">
    <AlertTriangle size={64} className="text-red-500 mb-4" />
    <h1 className="text-2xl font-bold text-red-900 mb-2">Ops! Ocorreu um erro crítico.</h1>
    <p className="text-red-700 mb-6">{message}</p>
    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">
      Reiniciar Aplicativo
    </button>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [manualName, setManualName] = useState('');

  const decodeJwt = (token: string) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleResponse = useCallback((response: any) => {
    try {
      const payload = decodeJwt(response.credential);
      if (payload && payload.email) {
        const loggedUser = StorageService.login(
          payload.email,
          payload.name || payload.email.split('@')[0],
          payload.picture || `https://picsum.photos/seed/${payload.email}/200`
        );
        setUser(loggedUser);
        setError('');
      } else {
        setError("Erro ao processar perfil do Google.");
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    }
  }, []);

  useEffect(() => {
    const initApp = () => {
      try {
        const db = JSON.parse(localStorage.getItem('medsearat_db_v1') || '{}');
        if (db && db.user) setUser(db.user);
      } catch (e) {
        console.error("Erro na carga inicial do storage.");
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      const timer = setTimeout(() => {
        // @ts-ignore
        if (typeof google !== 'undefined' && google.accounts) {
          try {
            // @ts-ignore
            google.accounts.id.initialize({
              client_id: "784323238474-example.apps.googleusercontent.com", 
              callback: handleGoogleResponse,
              auto_select: false
            });
            const btn = document.getElementById("googleBtn");
            // @ts-ignore
            if (btn) google.accounts.id.renderButton(btn, { theme: "outline", size: "large", width: "100%", shape: "pill" });
          } catch (e) {
            console.warn("Google Auth falhou ao iniciar.");
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, isRegistering, handleGoogleResponse]);

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!manualEmail || !manualPassword) {
      setError("Preencha email e senha.");
      return;
    }
    try {
      const loggedUser = StorageService.login(
        manualEmail,
        isRegistering ? manualName : manualEmail.split('@')[0],
        `https://picsum.photos/seed/${manualEmail}/200`
      );
      setUser(loggedUser);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse">Sincronizando MedSearat...</p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white p-16 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-white p-2 rounded-xl text-blue-600">
                <Stethoscope size={32} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">MedSearat</h1>
            </div>
            <h2 className="text-6xl font-black leading-tight tracking-tight mb-8">Gestão Médica <br /><span className="text-blue-200">Profissional.</span></h2>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md inline-flex">
              <ShieldCheck size={24} className="text-blue-200" />
              <span className="font-semibold">Segurança HIPAA e Criptografia Local</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/30">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900">Acesso ao Sistema</h2>
              <p className="text-slate-500 text-sm">Entre com suas credenciais médicas.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-bold flex items-center gap-3">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <form className="space-y-4" onSubmit={handleManualAuth}>
                {isRegistering && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Nome Completo" value={manualName} onChange={e => setManualName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="E-mail" value={manualEmail} onChange={e => setManualEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" placeholder="Senha" value={manualPassword} onChange={e => setManualPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                  {isRegistering ? 'Criar Registro' : 'Entrar'}
                </button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Acesso Rápido</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div id="googleBtn" className="w-full overflow-hidden rounded-full"></div>

              <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-xs text-slate-500 font-bold hover:text-blue-600">
                {isRegistering ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização principal protegida
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Carregando módulo...</div>}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            patients={StorageService.getPatients()} 
            evolutions={StorageService.getAllEvolutions()} 
            notes={StorageService.getNotes()} 
            communityPosts={StorageService.getPosts()}
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
