
import { AppState, UserProfile, Patient, Note, CommunityPost, Evolution, ClinicalFile } from '../types';

const STORAGE_KEY = 'medsearat_db_v1';

const INITIAL_STATE: AppState = {
  user: null,
  patients: [],
  evolutions: [],
  notes: [],
  communityPosts: []
};

export class StorageService {
  private static getState(): AppState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_STATE;
      
      const parsed = JSON.parse(data);
      // Garantir que todas as propriedades obrigatórias existam
      return {
        user: parsed.user || null,
        patients: Array.isArray(parsed.patients) ? parsed.patients : [],
        evolutions: Array.isArray(parsed.evolutions) ? parsed.evolutions : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        communityPosts: Array.isArray(parsed.communityPosts) ? parsed.communityPosts : []
      };
    } catch (e) {
      console.error("Storage Corrompido. Resetando para estado inicial.", e);
      localStorage.removeItem(STORAGE_KEY);
      return INITIAL_STATE;
    }
  }

  private static saveState(state: AppState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Erro ao salvar no Storage:", e);
    }
  }

  static login(email: string, fullName: string, avatarUrl: string): UserProfile {
    const state = this.getState();
    const deletedUsers = JSON.parse(localStorage.getItem('medsearat_deleted_users') || '[]');
    
    if (deletedUsers.includes(email)) {
       throw new Error("Esta conta foi encerrada definitivamente.");
    }

    const user: UserProfile = {
      id: state.user?.id || crypto.randomUUID(),
      email,
      fullName,
      avatarUrl,
      createdAt: state.user?.createdAt || new Date().toISOString()
    };
    
    state.user = user;
    this.saveState(state);
    return user;
  }

  static logout() {
    const state = this.getState();
    state.user = null;
    this.saveState(state);
  }

  static deleteAccount() {
    const state = this.getState();
    if (state.user) {
      const deletedUsers = JSON.parse(localStorage.getItem('medsearat_deleted_users') || '[]');
      deletedUsers.push(state.user.email);
      localStorage.setItem('medsearat_deleted_users', JSON.stringify(deletedUsers));
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }

  static updateProfile(data: Partial<UserProfile>): UserProfile {
    const state = this.getState();
    if (!state.user) throw new Error("Não autenticado");
    state.user = { ...state.user, ...data };
    this.saveState(state);
    return state.user;
  }

  static addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'doctorId' | 'files'>, files: ClinicalFile[]): Patient {
    const state = this.getState();
    const newPatient: Patient = {
      ...patient,
      id: crypto.randomUUID(),
      doctorId: state.user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: files || []
    };
    state.patients.push(newPatient);
    this.saveState(state);
    return newPatient;
  }

  static getPatients(): Patient[] {
    return this.getState().patients;
  }

  static addEvolution(patientId: string, content: string): Evolution {
    const state = this.getState();
    const evolution: Evolution = {
      id: crypto.randomUUID(),
      patientId,
      doctorId: state.user?.id || 'anonymous',
      authorName: state.user?.fullName || 'Médico',
      date: new Date().toISOString(),
      content
    };
    state.evolutions.push(evolution);
    this.saveState(state);
    return evolution;
  }

  static getEvolutions(patientId: string): Evolution[] {
    return this.getState().evolutions.filter(e => e.patientId === patientId);
  }

  static getAllEvolutions(): Evolution[] {
    return this.getState().evolutions;
  }

  static saveNote(note: Partial<Note>): Note {
    const state = this.getState();
    const userId = state.user?.id || 'anonymous';
    const existingIndex = state.notes.findIndex(n => n.id === note.id);
    
    if (existingIndex > -1) {
      state.notes[existingIndex] = { ...state.notes[existingIndex], ...note, updatedAt: new Date().toISOString() } as Note;
      this.saveState(state);
      return state.notes[existingIndex];
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        userId,
        title: note.title || 'Nova Nota',
        content: note.content || '',
        updatedAt: new Date().toISOString()
      };
      state.notes.push(newNote);
      this.saveState(state);
      return newNote;
    }
  }

  static getNotes(): Note[] {
    const state = this.getState();
    return state.notes.filter(n => n.userId === state.user?.id);
  }

  static deleteNote(id: string) {
    const state = this.getState();
    state.notes = state.notes.filter(n => n.id !== id);
    this.saveState(state);
  }

  static addPost(content: string, media?: ClinicalFile): CommunityPost {
    const state = this.getState();
    const post: CommunityPost = {
      id: crypto.randomUUID(),
      authorId: state.user?.id || 'anonymous',
      authorName: state.user?.fullName || 'Médico',
      authorAvatar: state.user?.avatarUrl,
      content,
      media,
      reactions: { love: [], like: [] },
      comments: [],
      createdAt: new Date().toISOString()
    };
    state.communityPosts.unshift(post);
    this.saveState(state);
    return post;
  }

  static getPosts(): CommunityPost[] {
    return this.getState().communityPosts;
  }

  static reactToPost(postId: string, type: 'love' | 'like') {
    const state = this.getState();
    const userId = state.user?.id;
    if (!userId) return;
    
    const post = state.communityPosts.find(p => p.id === postId);
    if (post) {
      const list = post.reactions[type];
      const index = list.indexOf(userId);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(userId);
      }
      this.saveState(state);
    }
  }
}
