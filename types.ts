
export enum Screen {
  LOGIN = 'LOGIN',
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  LIBRARY = 'LIBRARY',
  PLAYER = 'PLAYER',
  TWISTERS = 'TWISTERS',
  BREATHING = 'BREATHING',
  CHAT = 'CHAT',
  ROUTINE = 'ROUTINE',
  PROFILE = 'PROFILE',
  CALENDAR = 'CALENDAR',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  CONTRACT = 'CONTRACT'
}

export interface Vocalize {
  id: string;
  moduleId: string;
  title: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  bpm: number;
  key: string;
  description: string;
  audioUrl?: string;
  audioUrlMale?: string;
  exampleUrl?: string;
}

export interface TwisterExercise {
  id: string;
  module: string;
  moduleTitle: string;
  focus: string;
  title: string;
  text: string;
  difficulty: 'Nível 1' | 'Nível 2' | 'Desafio';
  instructions: string;
  targetBpm?: number;
}

export interface Module {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  topics: {
    id: string;
    title: string;
    description: string;
    content?: string;
  }[];
}

export type SubscriptionStatus = 'active' | 'overdue' | 'blocked';
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  status: 'active' | 'overdue' | 'blocked';
  plan?: string;
  nextDueDate?: string;
  amount?: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  avatarUrl: string;
  level: string;
  lastPractice: string;
  progress: number;
  status: 'active' | 'overdue' | 'blocked';
  phone: string;
  age: string;
  paymentDay?: string;
  notes?: string;
  modality?: 'Online' | 'Presencial';
  scheduleDay?: string;
  scheduleTime?: string;
  amount?: number;
  instrument?: string; // e.g., "Canto", "Piano"
  address?: string;
  instagram?: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl: string;
  time: string; // e.g., "09:00"
  endTime?: string; // e.g., "10:00"
  type: string; // e.g., "Canto - Avançado"
  status: 'confirmed' | 'pending' | 'finished';
  paymentStatus: 'active' | 'overdue'; // From mockup
}

export interface Task {
  id: string | number;
  time: string;
  title: string;
  duration: string;
  status: 'pending' | 'completed' | 'locked';
  category: string;
  date: string;
}
