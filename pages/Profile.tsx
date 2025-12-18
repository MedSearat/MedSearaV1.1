
import React, { useState } from 'react';
import { UserCircle, Mail, Calendar, User, Save, Trash2, Camera, AlertTriangle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Gender } from '../types';

const Profile: React.FC<{ user: any }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: user?.age || '',
    gender: user?.gender || Gender.MALE,
    avatarUrl: user?.avatarUrl || ''
  });

  const handleSave = () => {
    StorageService.updateProfile({
      fullName: formData.fullName,
      age: parseInt(formData.age.toString()),
      gender: formData.gender as Gender,
      avatarUrl: formData.avatarUrl
    });
    setIsEditing(false);
    window.location.reload();
  };

  const handleTerminate = () => {
    if (confirm("ATENÇÃO: Esta ação é definitiva. Sua conta e todos os dados serão excluídos. Você não poderá fazer login novamente com este email. Deseja prosseguir?")) {
      StorageService.deleteAccount();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Seu Perfil Profissional</h1>
        <p className="text-slate-500">Gerencie suas informações de exibição no MedSearat.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="relative inline-block">
              <img src={formData.avatarUrl || user?.avatarUrl} className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover bg-white" />
              {isEditing && (
                <label className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><User size={18} className="text-blue-500" /> {user.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Profissional</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><Mail size={18} className="text-blue-500" /> {user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Idade</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> {user.age || 'Não informado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gênero</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><UserCircle size={18} className="text-blue-500" /> {user.gender || 'Não informado'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Editar Perfil
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Nome Completo</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Idade</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Gênero</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={Gender.MALE}>Masculino</option>
                    <option value={Gender.FEMALE}>Feminino</option>
                    <option value={Gender.OTHER}>Outro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={24} />
          <h3 className="text-lg font-bold">Zona de Perigo</h3>
        </div>
        <p className="text-sm text-red-700 leading-relaxed">
          Ao encerrar sua conta, todos os seus dados, pacientes registrados, evoluções e notas serão removidos permanentemente. Esta ação não pode ser desfeita.
        </p>
        <button 
          onClick={handleTerminate}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <Trash2 size={18} /> Encerrar Minha Conta Definitivamente
        </button>
      </div>
    </div>
  );
};

export default Profile;
