import React from 'react';
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
  const { state, completeLesson, updateUserXP } = useAppContext();
  
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

  const isCompleted = state.user?.completedLessons.includes(lessonId) || false;

  const handleCompleteLesson = () => {
    if (!isCompleted) {
      completeLesson(lessonId);
      updateUserXP(lesson.xpReward);
    }
    onStartQuiz();
  };

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
            
            <Button 
              onClick={handleCompleteLesson}
              className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 w-full sm:w-auto"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {isCompleted ? 'Repasar Quiz' : 'Comenzar Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}