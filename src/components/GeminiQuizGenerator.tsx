import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, FileText, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateQuestionsWithGemini, extractTextFromFile } from '../utils/api';
import { toast } from '@/hooks/use-toast';


export function GeminiQuizGenerator() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startQuizSession } = useAppContext();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsExtracting(true);
    
    try {
      const extractedText = await extractTextFromFile(file);
      setContent(extractedText);
      toast({
        title: "Archivo procesado correctamente",
        description: `Se extrajo el contenido de ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo. Intente con otro formato.",
        variant: "destructive",
      });
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un tema para generar preguntas.",
        variant: "destructive",
      });
      return;
    }

    if (!content) {
      toast({
        title: "Error",
        description: "El documento de referencia es obligatorio para generar preguntas con IA.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const questions = await generateQuestionsWithGemini(topic, content);
      startQuizSession(topic, questions);
      setTopic('');
      setContent('');
      setFileName(null);
      toast({
        title: "¡Quiz generado!",
        description: `Se crearon ${questions.length} preguntas sobre ${topic} con IA.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo generar el quiz. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-indigo-600">
          <Sparkles className="h-6 w-6" />
          <span>Generador de Quiz con Gemini AI</span>
        </CardTitle>
        <p className="text-gray-600 text-sm sm:text-base px-2">
          La IA analizará documentos PDF, TXT o Word para generar preguntas personalizadas sobre el tema elegido. El documento es obligatorio.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="topic" className="text-sm font-medium text-gray-700">
            Tema del Quiz
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: React Hooks, Algoritmos de ordenamiento, APIs REST..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isGenerating}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="document" className="text-sm font-medium text-gray-700">
            Documento de referencia (obligatorio)
          </label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center w-full">
              <label 
                htmlFor="file-upload" 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
                  ${fileName ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-300'} 
                  hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                      <p className="text-sm text-indigo-600">Procesando documento...</p>
                    </>
                  ) : fileName ? (
                    <>
                      <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                      <p className="text-sm text-indigo-600 font-medium">{fileName}</p>
                      <p className="text-xs text-gray-500 mt-1">Contenido extraído correctamente</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold text-indigo-600">Haz clic para subir</span> o arrastra un archivo
                      </p>
                      <p className="text-xs text-gray-500">PDF, TXT, DOCX (Máx. 10MB)</p>
                    </>
                  )}
                </div>
                <input 
                  id="file-upload" 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={isGenerating || isExtracting}
                />
              </label>
            </div>
            {content && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto">
                <p className="font-medium text-xs text-gray-500 mb-1">Vista previa del contenido extraído:</p>
                <p className="whitespace-pre-wrap text-xs">{content.substring(0, 200)}...</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
              <FileText className="h-3 w-3" /> PDF
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
              <FileText className="h-3 w-3" /> TXT
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
              <FileText className="h-3 w-3" /> DOCX
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim() || !content}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 sm:px-8 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Quiz con IA
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
