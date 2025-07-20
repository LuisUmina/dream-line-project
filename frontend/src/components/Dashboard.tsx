import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Award, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function Dashboard() {
  const { state } = useAppContext();
  const user = state.user;

  if (!user) return null;

  const nextLevelXP = (user.level * 1000);
  const currentLevelProgress = (user.xp % 1000) / 10;

  const mockLeaderboard = [
    { name: 'Ana García', xp: 2450, rank: 1 },
    { name: 'Carlos López', xp: 2100, rank: 2 },
    { name: user.name, xp: user.xp, rank: 3 },
    { name: 'María Rodríguez', xp: 980, rank: 4 },
    { name: 'Juan Pérez', xp: 750, rank: 5 },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Progreso del Usuario */}
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Tu Progreso</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Nivel {user.level}</span>
              <span className="text-sm text-gray-600">{user.xp} / {nextLevelXP} XP</span>
            </div>
            <Progress value={currentLevelProgress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{user.completedLessons?.length || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Lecciones completadas</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{user.streak}</div>
              <div className="text-xs sm:text-sm text-gray-600">Días de racha</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Tus Logros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user.badges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-xl sm:text-2xl">{badge.icon}</div>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-gray-800">{badge.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{badge.description}</div>
                </div>
              </div>
            ))}
            
            {/* Logros próximos */}
            <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
              <div className="text-xl sm:text-2xl">🔥</div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-gray-600">Racha de Fuego</div>
                <div className="text-xs sm:text-sm text-gray-500">Mantén una racha de 10 días</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Clasificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Clasificación Semanal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeaderboard.map((entry) => (
              <div 
                key={entry.rank}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.name === user.name 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Badge 
                    variant={entry.rank <= 3 ? "default" : "secondary"}
                    className={`text-xs ${
                      entry.rank === 1 ? 'bg-yellow-500' :
                      entry.rank === 2 ? 'bg-gray-400' :
                      entry.rank === 3 ? 'bg-orange-600' : ''
                    }`}
                  >
                    #{entry.rank}
                  </Badge>
                  <span className={`font-medium text-sm sm:text-base ${
                    entry.name === user.name ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-sm sm:text-base">{entry.xp}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}