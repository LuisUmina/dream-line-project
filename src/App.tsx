import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { SkillTree } from './components/SkillTree';
import { Lesson } from './components/Lesson';
import { Quiz } from './components/Quiz';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { useAppContext } from './context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { AuthenticationModal } from './components/AuthenticationModal';
import { RegistrationModal } from './components/RegistrationModal';
import { PasswordResetModal } from './components/PasswordResetModal';
import { GeminiQuizGenerator } from './components/GeminiQuizGenerator';

type ViewMode = 'home' | 'lesson' | 'quiz' | 'dashboard' | 'profile';

function AppContent() {
  const { state } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isRegistrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setPasswordResetModalOpen] = useState(false);

  const handleStartLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setViewMode('lesson');
  };

  const handleStartQuiz = () => {
    setViewMode('quiz');
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setSelectedLessonId(null);
  };

  const handleOpenAuthModal = () => {
    setAuthModalOpen(true);
  };

  const handleOpenRegistrationModal = () => {
    setRegistrationModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleCloseRegistrationModal = () => {
    setRegistrationModalOpen(false);
  };
  
  const handleOpenPasswordResetModal = () => {
    setPasswordResetModalOpen(true);
  };

  const handleSwitchToProfile = () => {
    setViewMode('profile');
  };

  const handleSwitchToDashboard = () => {
    setViewMode('dashboard');
  };
  
  const handleClosePasswordResetModal = () => {
    setPasswordResetModalOpen(false);
  };

  // Mostrar quiz si hay una sesión activa
  if (state.currentQuizSession && viewMode !== 'quiz') {
    setViewMode('quiz');
  }

  // Volver al home cuando termina el quiz
  if (!state.currentQuizSession && viewMode === 'quiz') {
    setViewMode('home');
  }

  // Authentication guards for protected views
  if ((viewMode === 'dashboard' || viewMode === 'profile') && !state.user) {
    handleOpenAuthModal();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4 sm:py-8">
        {viewMode === 'home' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent px-4">
                ¡Aprende Programación de Forma Divertida!
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Domina los fundamentos de la programación con lecciones interactivas y quizzes generados por IA
              </p>
            </div>

            <Tabs defaultValue="lessons" className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-4 mb-6 sm:mb-8">
                <TabsTrigger value="lessons" className="text-sm sm:text-base lg:text-lg">
                  📚 Lecciones
                </TabsTrigger>
                <TabsTrigger value="ai-quiz" className="text-sm sm:text-base lg:text-lg">
                  🤖 Quiz con IA
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="text-sm sm:text-base lg:text-lg" onClick={() => {
                  if (!state.user) {
                    handleOpenAuthModal();
                  }
                }}>
                  📊 Panel
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="space-y-6">
                <SkillTree onStartLesson={handleStartLesson} />
              </TabsContent>

              <TabsContent value="ai-quiz" className="space-y-6">
                <div className="text-center mb-6 sm:mb-8 px-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Generador de Quiz con Inteligencia Artificial
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Escribe cualquier tema de programación y nuestra IA creará un quiz personalizado
                  </p>
                </div>
                <GeminiQuizGenerator />

                {/* Ejemplos de temas */}
                <Card className="bg-white/50 border-dashed">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-3">
                      💡 Ejemplos de temas populares:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {[
                        'React Hooks',
                        'APIs REST',
                        'CSS Grid',
                        'JavaScript ES6',
                        'Git y GitHub',
                        'Algoritmos',
                        'Bases de datos',
                        'Testing'
                      ].map(topic => (
                        <div 
                          key={topic}
                          className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6">
                <Dashboard />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {viewMode === 'lesson' && selectedLessonId && (
          <Lesson
            lessonId={selectedLessonId}
            onStartQuiz={handleStartQuiz}
            onBack={handleBackToHome}
          />
        )}

        {viewMode === 'quiz' && <Quiz />}
        
        {viewMode === 'profile' && <Profile />}
        
        {viewMode === 'dashboard' && <Dashboard />}
      </main>

      <AuthenticationModal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseAuthModal}
        onSwitchToRegister={handleOpenRegistrationModal}
        onForgotPassword={handleOpenPasswordResetModal}
        onSwitchToDashboard={handleSwitchToProfile}
      />
      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={handleCloseRegistrationModal}
        onSwitchToLogin={handleOpenAuthModal}
        onSwitchToDashboard={handleSwitchToProfile}
      />
      <PasswordResetModal 
        isOpen={isPasswordResetModalOpen} 
        onClose={handleClosePasswordResetModal}
        onSwitchToLogin={handleOpenAuthModal}
      />

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;