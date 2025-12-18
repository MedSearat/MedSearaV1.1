
export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Feminino',
  OTHER = 'Outro'
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  profession?: string;
  age?: number;
  gender?: Gender;
  avatarUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  gender: Gender;
  contact: string;
  email: string;
  consultationDate: string;
  // História Clínica Completa
  mainComplaint: string;
  currentHistory: string;
  physicalExam: string;
  labSummary: string;
  labComments: string;
  diagnosis: string;
  treatment: string;
  recommendations: string;
  createdAt: string;
  updatedAt: string;
  files: ClinicalFile[];
}

export interface ClinicalFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string; // Base64 or Supabase Storage URL
  uploadedAt: string;
}

export interface Evolution {
  id: string;
  patientId: string;
  doctorId: string;
  authorName: string;
  date: string;
  content: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  media?: ClinicalFile;
  reactions: {
    love: string[];
    like: string[];
  };
  comments: CommunityComment[];
  created_at: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  media?: ClinicalFile;
  createdAt: string;
}
