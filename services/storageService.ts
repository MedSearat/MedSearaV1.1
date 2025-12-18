
import { supabase } from './supabase';
import { UserProfile, Patient, Note, CommunityPost, Evolution, ClinicalFile, CommunityComment } from '../types';

export class StorageService {
  
  // AUTH METHODS
  static async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        profession: profile.profession,
        avatarUrl: profile.avatar_url,
        age: profile.age,
        gender: profile.gender
      };
    }

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
      avatarUrl: session.user.user_metadata.avatar_url,
      profession: ''
    };
  }

  static async logout() {
    await supabase.auth.signOut();
  }

  static async updateProfile(id: string, updates: Partial<UserProfile>) {
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.email !== undefined) dbUpdates.email = updates.email;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id, ...dbUpdates })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  static async deleteAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    window.location.reload();
  }

  // PATIENT METHODS
  static async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
    if (error) return [];
    return data as Patient[];
  }

  static async addPatient(patient: any, files: ClinicalFile[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from('patients')
      .insert([{
        ...patient,
        doctor_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // EVOLUTION METHODS
  static async getEvolutions(patientId: string) {
    const { data, error } = await supabase
      .from('evolutions')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    if (error) return [];
    return data as Evolution[];
  }

  static async getAllEvolutions() {
    const { data } = await supabase.from('evolutions').select('*');
    return data || [];
  }

  static async addEvolution(patientId: string, content: string, authorName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('evolutions')
      .insert([{
        patient_id: patientId,
        doctor_id: user?.id,
        author_name: authorName,
        content,
        date: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // NOTES METHODS
  static async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) return [];
    return data as Note[];
  }

  static async saveNote(note: Partial<Note>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const payload = {
      ...note,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notes')
      .upsert(payload)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id);
  }

  // COMMUNITY METHODS
  static async getPosts() {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data as CommunityPost[];
  }

  static async addPost(content: string, author: UserProfile, media?: ClinicalFile) {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([{
        author_id: author.id,
        author_name: author.fullName,
        author_avatar: author.avatarUrl,
        content,
        media,
        reactions: { love: [], like: [] },
        comments: [],
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updatePost(postId: string, content: string) {
    const { error } = await supabase
      .from('community_posts')
      .update({ content })
      .eq('id', postId);
    if (error) throw error;
  }

  static async deletePost(postId: string) {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);
    if (error) throw error;
  }

  static async reactToPost(postId: string, userId: string, type: 'love' | 'like') {
    const { data: post } = await supabase
      .from('community_posts')
      .select('reactions')
      .eq('id', postId)
      .single();

    if (post) {
      const reactions = { ...post.reactions };
      const list = reactions[type] || [];
      const index = list.indexOf(userId);
      
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(userId);
      }
      
      reactions[type] = list;

      await supabase
        .from('community_posts')
        .update({ reactions })
        .eq('id', postId);
    }
  }

  static async updateComments(postId: string, comments: CommunityComment[]) {
    const { error } = await supabase
      .from('community_posts')
      .update({ comments })
      .eq('id', postId);
    if (error) throw error;
  }
}
