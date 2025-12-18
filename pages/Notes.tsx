
import React, { useState, useEffect, useRef } from 'react';
// Added missing icon imports: StickyNote, X
import { Plus, Trash2, Search, CheckCircle2, Loader2, AlertCircle, StickyNote, X } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Note } from '../types';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  // Changed NodeJS.Timeout to any to avoid "Cannot find namespace 'NodeJS'" error in browser environment
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    setNotes(StorageService.getNotes());
  }, []);

  const handleCreateNote = () => {
    const newNote = StorageService.saveNote({ title: 'Sem Título', content: '' });
    setNotes(StorageService.getNotes());
    setSelectedNote(newNote);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apagar esta nota definitivamente?")) {
      StorageService.deleteNote(id);
      setNotes(StorageService.getNotes());
      if (selectedNote?.id === id) setSelectedNote(null);
    }
  };

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, [field]: value };
    setSelectedNote(updated);
    
    setSaveStatus('saving');
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        StorageService.saveNote(updated);
        setNotes(StorageService.getNotes());
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
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
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl border shadow-xl overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r flex flex-col bg-slate-50">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Notas</h2>
            <button onClick={handleCreateNote} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Filtrar notas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(n => (
            <div 
              key={n.id} onClick={() => setSelectedNote(n)}
              className={`p-4 border-b cursor-pointer transition-all hover:bg-white group ${selectedNote?.id === n.id ? 'bg-white border-l-4 border-l-blue-600' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 truncate pr-4">{n.title || 'Sem Título'}</h4>
                <button onClick={(e) => handleDeleteNote(n.id, e)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.content || 'Nenhum conteúdo...'}</p>
              <p className="text-[10px] text-slate-400 mt-2">{new Date(n.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-slate-400 text-sm">Nenhuma nota encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="hidden md:flex flex-1 flex-col relative">
        {selectedNote ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <input 
                type="text" value={selectedNote.title} onChange={e => handleUpdateNote('title', e.target.value)}
                className="text-xl font-bold text-slate-800 outline-none w-full bg-transparent"
                placeholder="Título da nota..."
              />
              <div className="flex items-center gap-2 whitespace-nowrap min-w-[120px] justify-end">
                {saveStatus === 'saving' && <span className="text-xs text-blue-500 flex items-center"><Loader2 className="animate-spin mr-1" size={12} /> Salvando...</span>}
                {saveStatus === 'saved' && <span className="text-xs text-green-500 flex items-center"><CheckCircle2 className="mr-1" size={12} /> Salvo</span>}
                {saveStatus === 'error' && <span className="text-xs text-red-500 flex items-center"><AlertCircle className="mr-1" size={12} /> Erro ao salvar</span>}
              </div>
            </div>
            <textarea 
              value={selectedNote.content} onChange={e => handleUpdateNote('content', e.target.value)}
              className="flex-1 p-8 outline-none text-slate-700 leading-relaxed resize-none text-lg"
              placeholder="Comece a escrever aqui..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <StickyNote size={64} strokeWidth={1} className="mb-4" />
            <p className="text-lg">Selecione uma nota ou crie uma nova.</p>
          </div>
        )}
      </div>

      {/* Mobile note overlay if selected */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <button onClick={() => setSelectedNote(null)} className="text-slate-500"><X /></button>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && <Loader2 className="animate-spin text-blue-500" size={16} />}
              {saveStatus === 'saved' && <CheckCircle2 className="text-green-500" size={16} />}
            </div>
          </div>
          <input 
            type="text" value={selectedNote.title} onChange={e => handleUpdateNote('title', e.target.value)}
            className="p-4 text-xl font-bold outline-none border-b"
          />
          <textarea 
            value={selectedNote.content} onChange={e => handleUpdateNote('content', e.target.value)}
            className="flex-1 p-4 outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default Notes;
