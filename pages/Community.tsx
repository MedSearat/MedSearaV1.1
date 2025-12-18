
import React, { useState, useEffect } from 'react';
import { Heart, ThumbsUp, MessageSquare, Send, Paperclip, Image as ImageIcon, Video, Trash2, Loader2, Edit3, X, Check, MoreHorizontal, FileText } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { CommunityPost, ClinicalFile, CommunityComment } from '../types';

const Community: React.FC<{ user: any }> = ({ user }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [pendingMedia, setPendingMedia] = useState<ClinicalFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States para controle de edição
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // States para comentários
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState<{ [key: string]: string }>({});
  const [pendingCommentMedia, setPendingCommentMedia] = useState<ClinicalFile | null>(null);

  const loadPosts = async () => {
    const data = await StorageService.getPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !pendingMedia) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await StorageService.addPost(newPostContent, user, pendingMedia || undefined);
      setNewPostContent('');
      setPendingMedia(null);
      await loadPosts();
    } catch (e) {
      alert("Erro ao publicar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editPostContent.trim()) return;
    try {
      await StorageService.updatePost(postId, editPostContent);
      setEditingPostId(null);
      await loadPosts();
    } catch (e) {
      alert("Erro ao atualizar.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Deseja remover esta publicação permanentemente?")) return;
    try {
      await StorageService.deletePost(postId);
      await loadPosts();
    } catch (e) {
      alert("Erro ao apagar.");
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newCommentContent[postId];
    if (!content?.trim() && !pendingCommentMedia) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment: CommunityComment = {
      id: crypto.randomUUID(),
      authorId: user.id,
      authorName: user.fullName,
      content: content || '',
      media: pendingCommentMedia || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      const updatedComments = [...(post.comments || []), newComment];
      await StorageService.updateComments(postId, updatedComments);
      setNewCommentContent({ ...newCommentContent, [postId]: '' });
      setPendingCommentMedia(null);
      await loadPosts();
    } catch (e) {
      alert("Erro ao comentar.");
    }
  };

  const handleUpdateComment = async (postId: string, commentId: string) => {
    if (!editCommentContent.trim()) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const updatedComments = post.comments.map(c => 
      c.id === commentId ? { ...c, content: editCommentContent } : c
    );

    try {
      await StorageService.updateComments(postId, updatedComments);
      setEditingCommentId(null);
      await loadPosts();
    } catch (e) {
      alert("Erro ao editar comentário.");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Deseja apagar seu comentário?")) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const updatedComments = post.comments.filter(c => c.id !== commentId);
    try {
      await StorageService.updateComments(postId, updatedComments);
      await loadPosts();
    } catch (e) {
      alert("Erro ao remover comentário.");
    }
  };

  const handleReact = async (postId: string, type: 'love' | 'like') => {
    await StorageService.reactToPost(postId, user.id, type);
    loadPosts();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document', isComment: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const payload: ClinicalFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type,
          url: reader.result as string,
          uploadedAt: new Date().toISOString()
        };
        if (isComment) {
          setPendingCommentMedia(payload);
        } else {
          setPendingMedia(payload);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Comunidade Clínica</h1>
        <p className="text-slate-500">Compartilhe casos, dúvidas e novidades com outros profissionais.</p>
      </header>

      {/* Input de Nova Publicação */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex gap-4">
          <img src={user.avatarUrl || `https://picsum.photos/seed/${user.email}/200`} className="w-12 h-12 rounded-2xl border bg-slate-50 object-cover" alt="User" />
          <textarea 
            placeholder="O que você está pesquisando ou acompanhando hoje?"
            className="flex-1 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[120px] text-sm text-slate-700 transition-all"
            value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
          />
        </div>
        
        {pendingMedia && (
          <div className="relative inline-block ml-16">
            {pendingMedia.type === 'image' ? (
              <img src={pendingMedia.url} className="h-32 w-auto rounded-xl border shadow-sm" alt="Preview" />
            ) : (
              <div className="h-20 px-4 flex items-center gap-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-xs font-bold">
                {pendingMedia.type === 'video' ? <Video size={18} /> : <Paperclip size={18} />} {pendingMedia.name}
              </div>
            )}
            <button onClick={() => setPendingMedia(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 ml-16">
          <div className="flex gap-1">
            <label className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all" title="Imagem">
              <ImageIcon size={20} />
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'image')} />
            </label>
            <label className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all" title="Vídeo">
              <Video size={20} />
              <input type="file" accept="video/*" className="hidden" onChange={e => handleFileChange(e, 'video')} />
            </label>
            <label className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all" title="Anexo">
              <Paperclip size={20} />
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileChange(e, 'document')} />
            </label>
          </div>
          <button 
            onClick={handleCreatePost}
            disabled={(!newPostContent.trim() && !pendingMedia) || isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Publicar
          </button>
        </div>
      </div>

      {/* Lista de Publicações */}
      <div className="space-y-6">
        {posts.length > 0 ? posts.map(post => (
          <article key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group/post">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={post.authorAvatar || `https://picsum.photos/seed/${post.authorId}/200`} className="w-10 h-10 rounded-xl border bg-slate-50 object-cover" alt="Author" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{post.authorName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{new Date(post.created_at || post.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              {post.authorId === user.id && (
                <div className="flex gap-1 opacity-0 group-hover/post:opacity-100 transition-all">
                  <button 
                    onClick={() => {
                      setEditingPostId(post.id);
                      setEditPostContent(post.content);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="px-5 pb-5 space-y-4">
              {editingPostId === post.id ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-blue-100">
                  <textarea 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-slate-700"
                    value={editPostContent}
                    onChange={e => setEditPostContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingPostId(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded-lg transition-all">Cancelar</button>
                    <button onClick={() => handleUpdatePost(post.id)} className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all">Salvar Alterações</button>
                  </div>
                </div>
              ) : (
                <>
                  {post.content && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>}
                  
                  {post.media && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                      {post.media.type === 'image' && <img src={post.media.url} className="w-full h-auto max-h-[600px] object-contain mx-auto" alt="Post content" />}
                      {post.media.type === 'video' && <video src={post.media.url} controls className="w-full max-h-[500px]" />}
                      {post.media.type === 'document' && (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <Paperclip size={40} className="mb-3 text-blue-500" />
                          <p className="text-sm font-bold text-slate-800 mb-4">{post.media.name}</p>
                          <a href={post.media.url} download={post.media.name} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-blue-600 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm">Baixar Documento</a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Rodapé do Post (Interações) */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
              <div className="flex gap-6">
                <button 
                  onClick={() => handleReact(post.id, 'love')}
                  className={`flex items-center gap-2 transition-all ${post.reactions?.love?.includes(user.id) ? 'text-red-500 scale-110' : 'text-slate-400 hover:text-red-500'}`}
                >
                  <Heart size={18} fill={post.reactions?.love?.includes(user.id) ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">{post.reactions?.love?.length || 0}</span>
                </button>
                <button 
                  onClick={() => handleReact(post.id, 'like')}
                  className={`flex items-center gap-2 transition-all ${post.reactions?.like?.includes(user.id) ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-600'}`}
                >
                  <ThumbsUp size={18} fill={post.reactions?.like?.includes(user.id) ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">{post.reactions?.like?.length || 0}</span>
                </button>
                <button 
                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  className={`flex items-center gap-2 transition-all hover:text-slate-800 ${expandedPostId === post.id ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  <MessageSquare size={18} />
                  <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                </button>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Discussão Médica</div>
            </div>

            {/* Seção de Comentários */}
            {expandedPostId === post.id && (
              <div className="bg-slate-50/50 border-t border-slate-100 p-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                {/* Input de Novo Comentário com Suporte a Mídia */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <img src={user.avatarUrl || `https://picsum.photos/seed/${user.email}/200`} className="w-9 h-9 rounded-xl object-cover border border-white shadow-sm" alt="User" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Adicione um comentário clínico..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                          value={newCommentContent[post.id] || ''}
                          onChange={e => setNewCommentContent({ ...newCommentContent, [post.id]: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)} 
                          disabled={!newCommentContent[post.id]?.trim() && !pendingCommentMedia}
                          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400">
                        <label className="p-1.5 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-all" title="Anexar Imagem">
                          <ImageIcon size={16} />
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'image', true)} />
                        </label>
                        <label className="p-1.5 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-all" title="Anexar Vídeo">
                          <Video size={16} />
                          <input type="file" accept="video/*" className="hidden" onChange={e => handleFileChange(e, 'video', true)} />
                        </label>
                        <label className="p-1.5 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-all" title="Anexar Arquivo">
                          <Paperclip size={16} />
                          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileChange(e, 'document', true)} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {pendingCommentMedia && (
                    <div className="relative inline-block ml-12 p-2 bg-white border rounded-xl shadow-sm border-blue-100">
                      {pendingCommentMedia.type === 'image' ? (
                        <img src={pendingCommentMedia.url} className="h-16 w-auto rounded-lg" alt="Preview" />
                      ) : (
                        <div className="h-10 px-3 flex items-center gap-2 text-[10px] font-bold text-blue-600">
                          <FileText size={14} /> {pendingCommentMedia.name}
                        </div>
                      )}
                      <button onClick={() => setPendingCommentMedia(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Lista de Comentários */}
                <div className="space-y-4">
                  {post.comments?.length > 0 ? [...post.comments].reverse().map(comment => (
                    <div key={comment.id} className="flex gap-3 group/comment">
                      <img src={`https://picsum.photos/seed/${comment.authorId}/100`} className="w-8 h-8 rounded-lg object-cover bg-slate-200" alt="C" />
                      <div className="flex-1 min-w-0">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm relative space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="text-[11px] font-black text-slate-800 tracking-tight">{comment.authorName}</h5>
                            {comment.authorId === user.id && (
                              <div className="flex gap-1 opacity-0 group-hover/comment:opacity-100 transition-all shrink-0">
                                <button 
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentContent(comment.content);
                                  }}
                                  className="text-slate-300 hover:text-blue-600 p-1"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="text-slate-300 hover:text-red-500 p-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg">
                              <input 
                                className="flex-1 bg-transparent text-xs outline-none text-slate-700"
                                value={editCommentContent}
                                onChange={e => setEditCommentContent(e.target.value)}
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <button onClick={() => handleUpdateComment(post.id, comment.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                                <button onClick={() => setEditingCommentId(null)} className="text-red-400 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {comment.content && <p className="text-xs text-slate-600 leading-relaxed break-words">{comment.content}</p>}
                              {comment.media && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-slate-50">
                                  {comment.media.type === 'image' && <img src={comment.media.url} className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(comment.media?.url, '_blank')} alt="Comment media" />}
                                  {comment.media.type === 'video' && <video src={comment.media.url} controls className="w-full max-h-48" />}
                                  {comment.media.type === 'document' && (
                                    <a href={comment.media.url} download={comment.media.name} className="flex items-center gap-2 p-3 bg-slate-50 text-blue-600 hover:bg-blue-50 transition-colors">
                                      <Paperclip size={14} />
                                      <span className="text-[10px] font-bold truncate">{comment.media.name}</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold ml-1 uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                      <MessageSquare size={24} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Seja o primeiro a colaborar</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        )) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
            <div className="p-6 bg-slate-50 rounded-3xl inline-block mb-4">
              <MessageSquare size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Sem conversas no momento</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Inicie uma nova discussão compartilhando seu conhecimento ou dúvidas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
