
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { getMedicalAdvice } from '../services/geminiService';

const SearAI: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input || loading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    
    const advice = await getMedicalAdvice(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', text: advice }]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto bg-white rounded-2xl border shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
      <header className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sear AI</h1>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <Sparkles size={10} /> Assistente Médico Inteligente
            </p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 space-y-4">
            <div className="p-4 bg-white rounded-3xl shadow-sm">
               <Bot size={48} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Olá! Eu sou o Sear AI.</h2>
            <p className="text-slate-500 max-w-sm">
              Estou pronto para ajudar com diagnósticos diferenciais, condutas terapêuticas, resumos de artigos e suporte à decisão clínica.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg mt-8">
              {["Causas de dor abdominal aguda", "Conduta para HAS estágio 2", "Efeitos colaterais do Metotrexato", "Resumo sobre Insuficiência Cardíaca"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="p-3 text-xs bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all text-left">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600 shadow-sm'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border rounded-tl-none whitespace-pre-wrap'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white border text-blue-600 shadow-sm flex items-center justify-center">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="p-4 bg-white text-slate-400 border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                Sear AI está pensando...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t">
        <div className="flex gap-4">
          <input 
            type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua consulta médica..."
            className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input || loading}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-4 text-center">
          O Sear AI pode apresentar erros. Verifique informações médicas críticas com fontes oficiais.
        </p>
      </div>
    </div>
  );
};

export default SearAI;
