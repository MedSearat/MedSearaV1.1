
import React, { useState, useEffect } from 'react';
import { Heart, ThumbsUp, MessageSquare, Send, Paperclip, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { CommunityPost, ClinicalFile } from '../types';

const Community: React.FC<{ user: any }> = ({ user }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [pendingMedia, setPendingMedia] = useState<ClinicalFile | null>(null);

  useEffect(() => {
    setPosts(StorageService.getPosts());
  }, []);

  const handleCreatePost = () => {
    if (!newPostContent && !pendingMedia) return;
    StorageService.addPost(newPostContent, pendingMedia || undefined);
    setNewPostContent('');
    setPendingMedia(null);
    setPosts(StorageService.getPosts());
  };

  const handleReact = (postId: string, type: 'love' | 'like') => {
    StorageService.reactToPost(postId, type);
    setPosts(StorageService.getPosts());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingMedia({
          id: crypto.randomUUID(),
          name: file.name,
          type,
          url: reader.result as string,
          uploadedAt: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Prevenir quebra se o usuário não estiver carregado (embora o App.tsx já filtre)
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Comunidade Clínica</h1>
        <p className="text-slate-500">Espaço profissional para troca de conhecimento.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex gap-4">
          <img src={user.avatarUrl || `https://picsum.photos/seed/${user.email}/200`} className="w-10 h-10 rounded-full border bg-slate-100" />
          <textarea 
            placeholder="O que deseja compartilhar com a comunidade médica?"
            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px] text-sm"
            value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
          />
        </div>
        
        {pendingMedia && (
          <div className="relative inline-block ml-14">
            {pendingMedia.type === 'image' ? (
              <img src={pendingMedia.url} className="h-24 w-auto rounded-lg border" />
            ) : (
              <div className="h-24 px-4 flex items-center gap-2 bg-slate-50 rounded-lg border text-xs">
                {pendingMedia.type === 'video' ? <Video size={16} /> : <Paperclip size={16} />} {pendingMedia.name}
              </div>
            )}
            <button onClick={() => setPendingMedia(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4 ml-14">
          <div className="flex gap-2">
            <label className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
              <ImageIcon size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'image')} />
            </label>
            <label className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
              <Video size={18} />
              <input type="file" accept="video/*" className="hidden" onChange={e => handleFileChange(e, 'video')} />
            </label>
            <label className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
              <Paperclip size={18} />
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileChange(e, 'document')} />
            </label>
          </div>
          <button 
            onClick={handleCreatePost}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
          >
            <Send size={16} /> Publicar
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.length > 0 ? posts.map(post => (
          <article key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <img src={post.authorAvatar || `https://picsum.photos/seed/${post.authorId}/200`} className="w-10 h-10 rounded-full border bg-slate-100" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{post.authorName}</h4>
                <p className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              
              {post.media && (
                <div className="rounded-xl overflow-hidden border">
                  {post.media.type === 'image' && <img src={post.media.url} className="w-full h-auto max-h-96 object-cover" />}
                  {post.media.type === 'video' && <video src={post.media.url} controls className="w-full" />}
                  {post.media.type === 'document' && (
                    <div className="p-8 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                      <Paperclip size={48} className="mb-2" />
                      <p className="text-sm font-bold">{post.media.name}</p>
                      <a href={post.media.url} download className="mt-4 text-blue-600 hover:underline">Baixar Documento</a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-between text-slate-500">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleReact(post.id, 'love')}
                  className={`flex items-center gap-1.5 transition-colors ${post.reactions.love.includes(user.id) ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart size={18} fill={post.reactions.love.includes(user.id) ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">{post.reactions.love.length}</span>
                </button>
                <button 
                  onClick={() => handleReact(post.id, 'like')}
                  className={`flex items-center gap-1.5 transition-colors ${post.reactions.like.includes(user.id) ? 'text-blue-600' : 'hover:text-blue-600'}`}
                >
                  <ThumbsUp size={18} fill={post.reactions.like.includes(user.id) ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">{post.reactions.like.length}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={18} />
                  <span className="text-xs font-bold">{post.comments.length}</span>
                </div>
              </div>
              <div className="text-[10px] uppercase font-black tracking-widest text-slate-300">MedSearat Social</div>
            </div>
          </article>
        )) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Seja o primeiro a publicar na comunidade!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
