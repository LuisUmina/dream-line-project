import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, BookOpen, Star, ArrowLeft } from 'lucide-react';
import { skillsData } from '../data/skillsData';
import { useAppContext } from '../context/AppContext';

interface LessonProps {
  lessonId: string;
  onStartQuiz: () => void;
  onBack: () => void;
}

export function Lesson({ lessonId, onStartQuiz, onBack }: LessonProps) {
  const { state, completeLesson, updateUserXP, startQuizSession } = useAppContext();
  const [showQuestions, setShowQuestions] = useState(false);
  
  const lesson = skillsData
    .flatMap(section => section.lessons)
    .find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-600">Lección no encontrada</h2>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = state.user?.completedLessons?.includes(lessonId) || false;

  const handleCompleteLesson = () => {
    if (!isCompleted) {
      completeLesson(lessonId);
      updateUserXP(lesson.xpReward);
    }
    
    // Start a quiz session with the lesson questions
    if (lesson.questions && lesson.questions.length > 0) {
      startQuizSession(lesson.title, lesson.questions);
      onStartQuiz(); // Navigate to quiz view
    } else {
      setShowQuestions(true); // If no quiz, just toggle question display
    }
  };

  // Function removed - using inline toggle instead

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button onClick={onBack} variant="ghost" className="text-blue-600 self-start">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al árbol de habilidades
            </Button>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={
                  lesson.difficulty === 'beginner' ? 'secondary' :
                  lesson.difficulty === 'intermediate' ? 'default' : 'destructive'
                }
                className="text-xs"
              >
                {lesson.difficulty === 'beginner' && 'Principiante'}
                {lesson.difficulty === 'intermediate' && 'Intermedio'}
                {lesson.difficulty === 'advanced' && 'Avanzado'}
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <Star className="h-3 w-3 mr-1" />
                {lesson.xpReward} XP
              </Badge>
            </div>
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl text-blue-800 mt-4">
            {lesson.title}
          </CardTitle>
          <p className="text-blue-600 text-base sm:text-lg">
            {lesson.description}
          </p>
        </CardHeader>
      </Card>

      {/* Contenido de la lección */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span>Contenido de la lección</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="prose max-w-none">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <div className="whitespace-pre-line text-sm sm:text-base text-gray-700 leading-relaxed">
              {lesson.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de práctica */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-green-800">
            ¡Hora de practicar!
          </CardTitle>
          <p className="text-sm sm:text-base text-green-600">
            Pon a prueba lo que has aprendido con nuestro quiz interactivo.
            {lesson.questions.length > 0 && ` Tenemos ${lesson.questions.length} preguntas preparadas para ti.`}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-green-600">
              {isCompleted ? (
                <span className="flex items-center">
                  ✅ Lección completada anteriormente
                </span>
              ) : (
                <span>
                  Completa el quiz para ganar {lesson.xpReward} puntos XP
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowQuestions(!showQuestions)}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 px-3 sm:px-4 w-full sm:w-auto"
              >
                {showQuestions ? 'Ocultar preguntas' : 'Ver preguntas'}
              </Button>
              <Button 
                onClick={handleCompleteLesson}
                className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 w-full sm:w-auto"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {isCompleted ? 'Repasar Quiz' : 'Comenzar Quiz'}
              </Button>
            </div>
          </div>

          {/* Render questions when showQuestions is true */}
          {showQuestions && lesson.questions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-green-800">Vista previa de preguntas:</h3>
              {lesson.questions.map((question, index) => (
                <div key={question.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:border-green-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={
                      question.type === 'multiple_choice' ? 'secondary' :
                      question.type === 'code_completion' ? 'default' :
                      question.type === 'debugging' ? 'outline' : 'destructive'
                    } className="text-xs">
                      {question.type === 'multiple_choice' && 'Opción múltiple'}
                      {question.type === 'code_completion' && 'Completar código'}
                      {question.type === 'debugging' && 'Depuración'}
                      {question.type === 'coding_task' && 'Tarea de código'}
                    </Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {question.xp} XP
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Pregunta {index + 1}: {question.question}
                  </h3>
                  {question.options && question.type === 'multiple_choice' && (
                    <div className="mt-3 space-y-2 pl-2">
                      {question.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-2 rounded-md bg-white border border-gray-100">
                          <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.options && question.type === 'code_completion' && (
                    <div className="mt-3">
                      <div className="rounded-md overflow-hidden border border-gray-200">
                        <div className="bg-[#1e1e1e] text-gray-300 text-xs px-4 py-1 flex items-center justify-between border-b border-gray-700">
                          <span>code-editor.js</span>
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                        </div>
                        <div className="bg-[#1e1e1e] p-4 font-mono overflow-x-auto">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="mb-2 last:mb-0">
                              <pre className="text-[#d4d4d4] text-sm whitespace-pre-wrap">{option}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {question.options && question.type === 'debugging' && (
                    <div className="mt-3">
                      <div className="rounded-md overflow-hidden border border-gray-200 mb-4">
                        <div className="bg-[#1e1e1e] text-gray-300 text-xs px-4 py-1 flex items-center justify-between border-b border-gray-700">
                          <span>debug-code.js</span>
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                        </div>
                        <div className="bg-[#1e1e1e] p-4 font-mono overflow-x-auto">
                          <pre className="text-[#d4d4d4] text-sm whitespace-pre-wrap">{question.question.split("Encuentra el error en este código:")[1]?.trim() || "// Código con error a depurar"}</pre>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 pl-2">
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-3 p-2 rounded-md bg-white border border-gray-100">
                            <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong className="text-green-700">Explicación:</strong> <span className="text-gray-600">{question.explanation}</span>
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={onStartQuiz}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2"
                  size="lg"
                >
                  Iniciar Quiz Completo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}