import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Question, QuizSession, Lesson } from '../types';
import { getCurrentSession, getUserProfile } from '../services/auth';
import { toast } from '@/hooks/use-toast';

interface AppState {
  user: User | null;
  currentQuizSession: QuizSession | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_XP'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'COMPLETE_LESSON'; payload: string }
  | { type: 'START_QUIZ'; payload: QuizSession }
  | { type: 'UPDATE_QUIZ'; payload: Partial<QuizSession> }
  | { type: 'END_QUIZ' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

const initialState: AppState = {
  user: null,
  currentQuizSession: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: action.payload !== null };
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
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
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
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          const { user, error } = await getUserProfile(session.user.id);
          if (user) {
            setUser(user);
          } else if (error) {
            toast({
              title: "Error",
              description: error,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Helper functions
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };
  
  const setLoading = (isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  };
  
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

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
        setUser,
        setLoading,
        setError
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