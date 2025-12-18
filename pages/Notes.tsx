
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, CheckCircle2, Loader2, AlertCircle, StickyNote, X, Database } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Note } from '../types';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const data = await StorageService.getNotes();
    setNotes(data);
  };

  const handleCreateNote = async () => {
    const newNote = await StorageService.saveNote({ title: 'Nota sem título', content: '' });
    if (newNote) {
      await fetchNotes();
      setSelectedNote(newNote);
    }
  };

  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Deseja apagar esta nota permanentemente?")) {
      await StorageService.deleteNote(id);
      await fetchNotes();
      if (selectedNote?.id === id) setSelectedNote(null);
    }
  };

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNote) return;
    
    const updated = { ...selectedNote, [field]: value };
    setSelectedNote(updated);
    
    setSaveStatus('saving');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        await StorageService.saveNote(updated);
        await fetchNotes();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        setSaveStatus('error');
      }
    }, 1000);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r flex flex-col bg-slate-50/50">
        <div className="p-6 border-b space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Bloco de Notas</h2>
            <button onClick={handleCreateNote} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg">
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Filtrar notas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-100 rounded-xl text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotes.map(n => (
            <div 
              key={n.id} onClick={() => setSelectedNote(n)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${selectedNote?.id === n.id ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-50' : 'bg-white/40 border-slate-100 hover:border-slate-300 hover:bg-white'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-bold text-xs truncate pr-8 ${selectedNote?.id === n.id ? 'text-blue-600' : 'text-slate-800'}`}>{n.title || 'Sem Título'}</h4>
                <button 
                  onClick={(e) => handleDeleteNote(n.id, e)} 
                  className="text-slate-300 hover:text-red-500 transition-all absolute top-4 right-4 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(n.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedNote ? (
          <>
            <div className="px-8 py-4 border-b flex items-center justify-between bg-white sticky top-0 z-10 min-h-[72px]">
              <input 
                type="text" value={selectedNote.title} onChange={e => handleUpdateNote('title', e.target.value)}
                className="text-xl font-black text-slate-800 outline-none w-full bg-transparent"
                placeholder="Título da nota..."
              />
              <div className="flex items-center gap-4 whitespace-nowrap min-w-[200px] justify-end border-l pl-4">
                <div className="flex items-center h-8">
                  {saveStatus === 'saving' && <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 flex items-center animate-pulse"><Loader2 className="animate-spin mr-2" size={12} /> Salvando...</span>}
                  {saveStatus === 'saved' && <span className="text-[9px] font-black uppercase tracking-widest text-green-500 flex items-center"><CheckCircle2 className="mr-2" size={12} /> Sincronizado</span>}
                  {saveStatus === 'error' && <span className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center"><AlertCircle className="mr-2" size={12} /> Erro de rede</span>}
                  {saveStatus === 'idle' && <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center"><Database className="mr-2" size={12} /> Banco Estável</span>}
                </div>
                <button 
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <textarea 
              value={selectedNote.content} onChange={e => handleUpdateNote('content', e.target.value)}
              className="flex-1 p-10 outline-none text-slate-700 leading-relaxed resize-none text-lg bg-slate-50/10"
              placeholder="Digite suas anotações médicas privadas aqui..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
            <div className="p-8 bg-slate-50 rounded-full mb-4">
              <StickyNote size={64} />
            </div>
            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">Área de Rascunhos</h3>
          </div>
        )}
      </div>

      {/* Mobile note overlay */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-slate-50">
            <button onClick={() => setSelectedNote(null)} className="p-2 bg-white rounded-xl border"><X size={18}/></button>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black uppercase text-slate-400">{saveStatus === 'saving' ? 'Salvando...' : 'Auto-save on'}</span>
              <button onClick={() => handleDeleteNote(selectedNote.id)} className="p-2 text-red-500 bg-white rounded-xl border"><Trash2 size={18} /></button>
            </div>
          </div>
          <input 
            type="text" value={selectedNote.title} onChange={e => handleUpdateNote('title', e.target.value)}
            className="p-5 text-lg font-black outline-none border-b"
          />
          <textarea 
            value={selectedNote.content} onChange={e => handleUpdateNote('content', e.target.value)}
            className="flex-1 p-5 outline-none resize-none text-base leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};

export default Notes;
