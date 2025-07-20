import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { submitAnswer } from '../utils/api';
import { toast } from '@/hooks/use-toast';

export function Quiz() {
  const { state, updateQuizSession, endQuizSession, updateUserXP } = useAppContext();
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string; xpEarned: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = state.currentQuizSession;
  
  if (!session) return null;

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Selecciona una respuesta",
        description: "Por favor, elige una opción antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAnswer(currentQuestion.id, selectedAnswer, currentQuestion.correctAnswer);
      setFeedback(result);
      setShowFeedback(true);
      
      if (result.isCorrect) {
        updateUserXP(result.xpEarned);
        updateQuizSession({ 
          score: session.score + result.xpEarned 
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Completar quiz
      updateQuizSession({ 
        isCompleted: true,
        completedAt: new Date().toISOString()
      });
      toast({
        title: "¡Quiz completado!",
        description: `Obtuviste ${session.score} puntos en total.`,
      });
      endQuizSession();
    } else {
      // Siguiente pregunta
      updateQuizSession({ 
        currentQuestionIndex: session.currentQuestionIndex + 1 
      });
      setSelectedAnswer('');
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer('');
    setShowFeedback(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
      {/* Header del Quiz */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Quiz: {session.topic}</CardTitle>
              <p className="text-blue-100 text-sm sm:text-base">
                Pregunta {session.currentQuestionIndex + 1} de {session.questions.length}
              </p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xl sm:text-2xl font-bold">{session.score}</div>
              <div className="text-xs sm:text-sm text-blue-100">puntos</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4 bg-white/20" />
        </CardHeader>
      </Card>

      {/* Pregunta */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              {currentQuestion.type === 'multiple_choice' && 'Opción múltiple'}
              {currentQuestion.type === 'code_completion' && 'Completar código'}
              {currentQuestion.type === 'debugging' && 'Depuración'}
              {currentQuestion.type === 'coding_task' && 'Tarea de código'}
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-600">
              {currentQuestion.xp} XP
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {!showFeedback ? (
            <div className="space-y-4">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-300 bg-white shadow-md hover:border-blue-500 hover:bg-blue-100 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} className="h-5 w-5" />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="text-sm sm:text-base cursor-pointer flex-1 text-gray-700"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'code_completion' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <div className="bg-[#1e1e1e] text-gray-300 text-xs px-4 py-1 flex items-center justify-between border-b border-gray-700">
                      <span>code-editor.js</span>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="bg-[#1e1e1e] p-4 text-sm sm:text-base font-mono overflow-x-auto">
                      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-4">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <RadioGroupItem value={option} id={`option-${index}`} className="h-5 w-5 mt-1 bg-gray-800 border-gray-600" />
                            <Label 
                              htmlFor={`option-${index}`}
                              className="cursor-pointer flex-1 whitespace-pre text-[#d4d4d4] leading-relaxed"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}
              
              {currentQuestion.type === 'debugging' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="rounded-md overflow-hidden border border-gray-200 mb-4">
                    <div className="bg-[#1e1e1e] text-gray-300 text-xs px-4 py-1 flex items-center justify-between border-b border-gray-700">
                      <span>debug-code.js</span>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="bg-[#1e1e1e] p-4 text-sm sm:text-base font-mono overflow-x-auto">
                      <pre className="text-[#d4d4d4] whitespace-pre-wrap">{currentQuestion.question.split("Encuentra el error en este código:")[1]?.trim() || "// Código con error a depurar"}</pre>
                    </div>
                  </div>
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3 mt-4">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-300 bg-white shadow-md hover:border-blue-500 hover:bg-blue-100 transition-colors">
                        <RadioGroupItem value={option} id={`option-${index}`} className="h-5 w-5" />
                        <Label 
                          htmlFor={`option-${index}`}
                          className="text-sm sm:text-base cursor-pointer flex-1 text-gray-700"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="flex justify-center sm:justify-end pt-4">
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 px-6 sm:px-8 w-full sm:w-auto"
                  size="lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Feedback */}
              <div className={`p-6 rounded-lg border-2 ${
                feedback?.isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  {feedback?.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span className={`font-semibold text-base sm:text-lg ${
                    feedback?.isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {feedback?.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                  </span>
                  {feedback?.isCorrect && (
                    <Badge className="bg-green-500">
                      +{feedback.xpEarned} XP
                    </Badge>
                  )}
                </div>
                <p className={`text-sm sm:text-base ${
                  feedback?.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {feedback?.feedback}
                </p>
                <div className="mt-4 p-4 bg-white rounded border">
                  <p className="text-sm text-gray-600 font-medium">Explicación:</p>
                  <p className="text-sm sm:text-base text-gray-700 mt-1">{currentQuestion.explanation}</p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                {!feedback?.isCorrect && (
                  <Button 
                    onClick={handleRetry}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Intentar de nuevo
                  </Button>
                )}
                
                <Button 
                  onClick={handleNext}
                  className={`${
                    isLastQuestion 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } w-full sm:w-auto sm:ml-auto px-6 sm:px-8`}
                  size="lg"
                >
                  {isLastQuestion ? (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Finalizar Quiz
                    </>
                  ) : (
                    <>
                      Siguiente pregunta
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}