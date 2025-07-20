import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateQuestions } from '../utils/api';
import { toast } from '@/hooks/use-toast';

export function TopicInput() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { startQuizSession } = useAppContext();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un tema para generar preguntas.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const questions = await generateQuestions(topic);
      startQuizSession(topic, questions);
      setTopic('');
      toast({
        title: "¡Quiz generado!",
        description: `Se crearon ${questions.length} preguntas sobre ${topic}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el quiz. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-dashed border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-blue-600">
          <Sparkles className="h-6 w-6" />
          <span>Generador de Quiz con IA</span>
        </CardTitle>
        <p className="text-gray-600 text-sm sm:text-base px-2">
          Escribe cualquier tema de programación y la IA creará un quiz personalizado para ti
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ej: APIs REST, React Hooks, algoritmos..."
            className="flex-1 text-base sm:text-lg"
            disabled={isGenerating}
          />
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 sm:px-6 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Quiz
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            Temas populares: JavaScript, Python, HTML/CSS, Bases de datos, Git
          </p>
        </div>
      </CardContent>
    </Card>
  );
}