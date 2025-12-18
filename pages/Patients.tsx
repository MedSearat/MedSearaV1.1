
import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, ChevronRight, Save, Trash2, Image as ImageIcon, Video, Paperclip, X, History, User } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Patient, Gender, Evolution, ClinicalFile } from '../types';

const Patients: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'details'>('list');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [newEvolution, setNewEvolution] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '', age: 0, gender: Gender.MALE, contact: '', email: '', consultationDate: new Date().toISOString().split('T')[0],
    mainComplaint: '', currentHistory: '', physicalExam: '', labSummary: '', labComments: '', diagnosis: '', treatment: '', recommendations: ''
  });
  const [pendingFiles, setPendingFiles] = useState<ClinicalFile[]>([]);

  useEffect(() => {
    setPatients(StorageService.getPatients());
  }, [view]);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSavePatient = () => {
    if (!formData.name) return alert("Nome é obrigatório");
    StorageService.addPatient(formData as any, pendingFiles);
    setView('list');
    setFormData({ name: '', age: 0, gender: Gender.MALE, contact: '', email: '', consultationDate: new Date().toISOString().split('T')[0], mainComplaint: '', currentHistory: '', physicalExam: '', labSummary: '', labComments: '', diagnosis: '', treatment: '', recommendations: '' });
    setPendingFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: ClinicalFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type,
          url: reader.result as string,
          uploadedAt: new Date().toISOString()
        };
        setPendingFiles([...pendingFiles, newFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setEvolutions(StorageService.getEvolutions(p.id));
    setView('details');
  };

  const handleAddEvolution = () => {
    if (!newEvolution || !selectedPatient) return;
    StorageService.addEvolution(selectedPatient.id, newEvolution);
    setEvolutions(StorageService.getEvolutions(selectedPatient.id));
    setNewEvolution('');
  };

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Pacientes</h1>
            <button onClick={() => setView('add')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
              <Plus size={20} /> Cadastrar Paciente
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Pesquisar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map(p => (
              <div key={p.id} onClick={() => selectPatient(p)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                    {p.name.charAt(0)}
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{p.age} anos • {p.gender}</p>
                <div className="flex items-center text-xs text-slate-400">
                  <FileText size={14} className="mr-1" />
                  Última consulta: {p.consultationDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'add' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
          <div className="p-6 border-b flex items-center justify-between bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Novo Registo Clínico</h2>
            <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800"><X /></button>
          </div>
          <div className="p-8 space-y-8 h-[70vh] overflow-y-auto">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="font-bold text-blue-600 flex items-center gap-2"><User size={18} /> Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome Completo" className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Idade" className="px-4 py-2 border rounded-lg" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} />
                  <select className="px-4 py-2 border rounded-lg" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                    <option value={Gender.MALE}>Masculino</option>
                    <option value={Gender.FEMALE}>Feminino</option>
                    <option value={Gender.OTHER}>Outro</option>
                  </select>
                </div>
                <input type="text" placeholder="Contacto" className="w-full px-4 py-2 border rounded-lg" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.consultationDate} onChange={e => setFormData({...formData, consultationDate: e.target.value})} />
              </div>
            </section>

            {/* Clinical History */}
            <section className="space-y-4">
              <h3 className="font-bold text-blue-600 flex items-center gap-2"><FileText size={18} /> História Clínica</h3>
              <div className="space-y-4">
                <textarea placeholder="Queixa Principal" rows={2} className="w-full px-4 py-2 border rounded-lg" value={formData.mainComplaint} onChange={e => setFormData({...formData, mainComplaint: e.target.value})} />
                <textarea placeholder="História da Doença Atual" rows={4} className="w-full px-4 py-2 border rounded-lg" value={formData.currentHistory} onChange={e => setFormData({...formData, currentHistory: e.target.value})} />
                <textarea placeholder="Exame Físico" rows={4} className="w-full px-4 py-2 border rounded-lg" value={formData.physicalExam} onChange={e => setFormData({...formData, physicalExam: e.target.value})} />
              </div>
            </section>

            {/* Labs and Diagnosis */}
            <section className="space-y-4">
              <h3 className="font-bold text-blue-600">Análises e Diagnóstico</h3>
              <div className="space-y-4">
                <textarea placeholder="Resumo de Análises" rows={3} className="w-full px-4 py-2 border rounded-lg" value={formData.labSummary} onChange={e => setFormData({...formData, labSummary: e.target.value})} />
                <textarea placeholder="Comentários das Análises" rows={2} className="w-full px-4 py-2 border rounded-lg" value={formData.labComments} onChange={e => setFormData({...formData, labComments: e.target.value})} />
                <textarea placeholder="Diagnóstico Final" rows={2} className="w-full px-4 py-2 border rounded-lg" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
                <textarea placeholder="Tratamento Proposto" rows={3} className="w-full px-4 py-2 border rounded-lg" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} />
                <textarea placeholder="Recomendações ao Paciente" rows={3} className="w-full px-4 py-2 border rounded-lg" value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} />
              </div>
            </section>

            {/* Uploads */}
            <section className="space-y-4">
              <h3 className="font-bold text-blue-600 flex items-center gap-2">Anexos Clínicos</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <ImageIcon size={18} /> Imagem
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'image')} />
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <Video size={18} /> Vídeo
                  <input type="file" accept="video/*" className="hidden" onChange={e => handleFileChange(e, 'video')} />
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <Paperclip size={18} /> Documento
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileChange(e, 'document')} />
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {pendingFiles.map(f => (
                  <div key={f.id} className="relative group rounded-lg overflow-hidden border">
                    {f.type === 'image' ? (
                      <img src={f.url} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-slate-50 flex items-center justify-center text-slate-400">
                        {f.type === 'video' ? <Video size={32} /> : <Paperclip size={32} />}
                      </div>
                    )}
                    <button onClick={() => setPendingFiles(pendingFiles.filter(pf => pf.id !== f.id))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                    <p className="text-[10px] p-1 truncate bg-white border-t">{f.name}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="p-6 border-t bg-slate-50 flex justify-end gap-4">
            <button onClick={() => setView('list')} className="px-6 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
            <button onClick={handleSavePatient} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
              <Save size={18} /> Salvar Registo
            </button>
          </div>
        </div>
      )}

      {view === 'details' && selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          {/* Main Summary - A4 Layout */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 shadow-2xl rounded-sm border border-slate-200 medical-font min-h-[1100px] max-w-full">
              <header className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Resumo Clínico</h1>
                  <p className="text-sm font-bold text-slate-600">MedSearat Digital Health Systems</p>
                </div>
                <div className="text-right text-xs">
                  <p>Data de Emissão: {new Date().toLocaleDateString()}</p>
                  <p>ID Registo: {selectedPatient.id.slice(0, 8)}</p>
                </div>
              </header>

              <div className="space-y-8 text-slate-800 leading-relaxed">
                <section>
                  <h2 className="text-lg font-bold bg-slate-100 px-2 py-1 mb-3 uppercase">Identificação do Paciente</h2>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p><strong>Nome:</strong> {selectedPatient.name}</p>
                    <p><strong>Idade:</strong> {selectedPatient.age} anos</p>
                    <p><strong>Sexo:</strong> {selectedPatient.gender}</p>
                    <p><strong>Contacto:</strong> {selectedPatient.contact}</p>
                    <p><strong>Data Consulta:</strong> {selectedPatient.consultationDate}</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold bg-slate-100 px-2 py-1 mb-3 uppercase">História Clínica</h2>
                  <div className="space-y-4 text-sm">
                    <div><p className="font-bold text-slate-600 mb-1">Queixa Principal:</p><p>{selectedPatient.mainComplaint}</p></div>
                    <div><p className="font-bold text-slate-600 mb-1">História Atual:</p><p>{selectedPatient.currentHistory}</p></div>
                    <div><p className="font-bold text-slate-600 mb-1">Exame Físico:</p><p>{selectedPatient.physicalExam}</p></div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold bg-slate-100 px-2 py-1 mb-3 uppercase">Exames e Diagnóstico</h2>
                  <div className="space-y-4 text-sm">
                    <div><p className="font-bold text-slate-600 mb-1">Resumo Laboratorial:</p><p>{selectedPatient.labSummary}</p></div>
                    <div><p className="font-bold text-slate-600 mb-1">Anexos Referenciados:</p><p>{selectedPatient.files.length} arquivos vinculados ao histórico.</p></div>
                    <div className="p-3 border-2 border-slate-900 bg-slate-50">
                      <p className="font-black text-slate-900 mb-1">DIAGNÓSTICO:</p>
                      <p className="text-lg uppercase">{selectedPatient.diagnosis}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold bg-slate-100 px-2 py-1 mb-3 uppercase">Plano Terapêutico</h2>
                  <div className="space-y-4 text-sm">
                    <div><p className="font-bold text-slate-600 mb-1">Tratamento:</p><p>{selectedPatient.treatment}</p></div>
                    <div><p className="font-bold text-slate-600 mb-1">Recomendações:</p><p>{selectedPatient.recommendations}</p></div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold bg-slate-100 px-2 py-1 mb-3 uppercase">Evoluções Cronológicas</h2>
                  <div className="space-y-6">
                    {evolutions.length > 0 ? evolutions.map(ev => (
                      <div key={ev.id} className="border-l-2 border-slate-400 pl-4 py-1">
                        <p className="text-xs font-bold text-slate-500 mb-1">{new Date(ev.date).toLocaleString()} - Dr(a). {ev.authorName}</p>
                        <p className="text-sm">{ev.content}</p>
                      </div>
                    )) : <p className="text-sm text-slate-400 italic">Nenhuma evolução registada até ao momento.</p>}
                  </div>
                </section>
              </div>

              <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Documento assinado digitalmente via plataforma MedSearat. Válido em todo território nacional.
              </footer>
            </div>
            <button onClick={() => window.print()} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors">Exportar para PDF / Imprimir</button>
          </div>

          {/* Sidebar - Actions & Evolutions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><History size={18} /> Nova Evolução</h3>
              <textarea 
                placeholder="Escreva a evolução diária ou observações..." rows={6}
                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-sm"
                value={newEvolution} onChange={e => setNewEvolution(e.target.value)}
              />
              <button 
                onClick={handleAddEvolution}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Registar Evolução
              </button>
              
              <div className="mt-8">
                <h4 className="font-bold text-slate-700 text-sm mb-3">Anexos Vinculados</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedPatient.files.map(f => (
                    <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="block relative h-16 rounded border overflow-hidden">
                      {f.type === 'image' ? (
                        <img src={f.url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                          {f.type === 'video' ? <Video size={16} /> : <Paperclip size={16} />}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>

              <button onClick={() => setView('list')} className="w-full mt-6 py-2 border rounded-lg text-slate-500 hover:bg-slate-50 transition-colors text-sm">Voltar para Lista</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
