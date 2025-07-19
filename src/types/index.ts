export interface User {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  badges: Badge[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'code_completion' | 'debugging' | 'coding_task';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  xp: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  prerequisites: string[];
  content: string;
  questions: Question[];
  isLocked: boolean;
  isCompleted: boolean;
}

export interface SkillSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  isUnlocked: boolean;
}

export interface QuizSession {
  id: string;
  topic: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  weeklyXp: number;
}