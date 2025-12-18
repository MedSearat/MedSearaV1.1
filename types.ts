
export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Feminino',
  OTHER = 'Outro'
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
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
  // Clinical History
  mainComplaint: string;
  currentHistory: string;
  physicalExam: string;
  labSummary: string;
  labComments: string;
  diagnosis: string;
  treatment: string;
  recommendations: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  files: ClinicalFile[];
}

export interface ClinicalFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
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
    love: string[]; // User IDs
    like: string[]; // User IDs
  };
  comments: CommunityComment[];
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  media?: ClinicalFile;
  createdAt: string;
}

export type AppState = {
  user: UserProfile | null;
  patients: Patient[];
  evolutions: Evolution[];
  notes: Note[];
  communityPosts: CommunityPost[];
};
