import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Question, QuizSession, Lesson } from '../types';

interface AppState {
  user: User | null;
  currentQuizSession: QuizSession | null;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_XP'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'COMPLETE_LESSON'; payload: string }
  | { type: 'START_QUIZ'; payload: QuizSession }
  | { type: 'UPDATE_QUIZ'; payload: Partial<QuizSession> }
  | { type: 'END_QUIZ' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  user: null,
  currentQuizSession: null,
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_XP':
      return {
        ...state,
        user: state.user ? { ...state.user, xp: state.user.xp + action.payload } : null,
      };
    case 'UPDATE_STREAK':
      return {
        ...state,
        user: state.user ? { ...state.user, streak: action.payload } : null,
      };
    case 'COMPLETE_LESSON':
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              completedLessons: [...state.user.completedLessons, action.payload],
            }
          : null,
      };
    case 'START_QUIZ':
      return { ...state, currentQuizSession: action.payload };
    case 'UPDATE_QUIZ':
      return {
        ...state,
        currentQuizSession: state.currentQuizSession
          ? { ...state.currentQuizSession, ...action.payload }
          : null,
      };
    case 'END_QUIZ':
      return { ...state, currentQuizSession: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  updateUserXP: (xp: number) => void;
  completeLesson: (lessonId: string) => void;
  startQuizSession: (topic: string, questions: Question[]) => void;
  updateQuizSession: (updates: Partial<QuizSession>) => void;
  endQuizSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Mock user for demo
  useEffect(() => {
    const mockUser: User = {
      id: '1',
      email: 'usuario@ejemplo.com',
      name: 'Estudiante',
      xp: 1250,
      level: 3,
      streak: 7,
      lastActiveDate: new Date().toISOString(),
      completedLessons: ['variables-basics', 'data-types'],
      badges: [
        {
          id: 'first-lesson',
          name: 'Primer Paso',
          description: 'Completaste tu primera lección',
          icon: '🎉',
          earnedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SET_USER', payload: mockUser });
  }, []);

  const updateUserXP = (xp: number) => {
    dispatch({ type: 'UPDATE_XP', payload: xp });
  };

  const completeLesson = (lessonId: string) => {
    dispatch({ type: 'COMPLETE_LESSON', payload: lessonId });
  };

  const startQuizSession = (topic: string, questions: Question[]) => {
    const session: QuizSession = {
      id: Date.now().toString(),
      topic,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      isCompleted: false,
      startedAt: new Date().toISOString(),
    };
    dispatch({ type: 'START_QUIZ', payload: session });
  };

  const updateQuizSession = (updates: Partial<QuizSession>) => {
    dispatch({ type: 'UPDATE_QUIZ', payload: updates });
  };

  const endQuizSession = () => {
    dispatch({ type: 'END_QUIZ' });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        updateUserXP,
        completeLesson,
        startQuizSession,
        updateQuizSession,
        endQuizSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}