import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Play, Star } from 'lucide-react';
import { skillsData } from '../data/skillsData';
import { useAppContext } from '../context/AppContext';

interface SkillTreeProps {
  onStartLesson: (lessonId: string) => void;
}

export function SkillTree({ onStartLesson }: SkillTreeProps) {
  const { state } = useAppContext();
  const user = state.user;

  const getLessonStatus = (lesson: any) => {
    if (!user) return 'locked';
    
    const completedLessons = user.completedLessons || [];
    
    if (completedLessons.includes(lesson.id)) {
      return 'completed';
    }
    
    const hasPrerequisites = lesson.prerequisites.every((prereq: string) =>
      completedLessons.includes(prereq)
    );
    
    return hasPrerequisites ? 'available' : 'locked';
  };

  const getSectionProgress = (section: any) => {
    if (!user) return 0;
    
    const completedLessons = user.completedLessons || [];
    const completedCount = section.lessons.filter((lesson: any) =>
      completedLessons.includes(lesson.id)
    ).length;
    return (completedCount / section.lessons.length) * 100;
  };

  return (
    <div className="space-y-8">
      {skillsData.map((section) => {
        const progress = getSectionProgress(section);
        
        return (
          <Card key={section.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{section.icon}</div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-800">
                      {section.title}
                    </CardTitle>
                    <p className="text-sm sm:text-base text-gray-600">{section.description}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {Math.round(progress)}%
                  </div>
                  <Progress value={progress} className="w-full sm:w-20 mt-1" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.lessons.map((lesson) => {
                  const status = getLessonStatus(lesson);
                  
                  return (
                    <Card 
                      key={lesson.id}
                      className={`relative transition-all hover:scale-102 sm:hover:scale-105 ${
                        status === 'completed' 
                          ? 'bg-green-50 border-green-200' 
                          : status === 'available'
                          ? 'bg-white border-blue-200 hover:border-blue-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                              <span>{lesson.title}</span>
                              {status === 'completed' && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              {status === 'locked' && (
                                <Lock className="h-5 w-5 text-gray-400" />
                              )}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
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
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Star className="h-4 w-4" />
                            <span className="text-xs sm:text-sm font-semibold">{lesson.xpReward} XP</span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onStartLesson(lesson.id)}
                          disabled={status === 'locked'}
                          size="sm"
                          className={`w-full ${
                            status === 'completed'
                              ? 'bg-green-500 hover:bg-green-600'
                              : status === 'available'
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-gray-400'
                          }`}
                        >
                          {status === 'locked' ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Bloqueado
                            </>
                          ) : status === 'completed' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Repasar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Comenzar
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}