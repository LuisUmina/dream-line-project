import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Users, 
  Calendar,
  Mail,
  User as UserIcon,
  Star,
  Flame,
  Settings,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { signOut } from '@/services/auth';
import { toast } from '@/hooks/use-toast';

export function Profile() {
  const { state, setUser } = useAppContext();
  const user = state.user;
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const nextLevelXP = (user.level * 1000);
  const currentLevelProgress = (user.xp % 1000) / 10;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        setUser(null);
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión exitosamente",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const mockLeaderboard = [
    { name: 'Ana García', xp: 2450, rank: 1 },
    { name: 'Carlos López', xp: 2100, rank: 2 },
    { name: user.name, xp: user.xp, rank: 3 },
    { name: 'María Rodríguez', xp: 980, rank: 4 },
    { name: 'Juan Pérez', xp: 750, rank: 5 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-green-100">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde {formatDate(user.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  Nivel {user.level}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  {user.xp} XP
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  <Flame className="h-4 w-4 mr-1" />
                  {user.streak} días de racha
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button 
                variant="outline" 
                className="bg-red-500/20 border-red-300/50 text-white hover:bg-red-500/30"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Level Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Progreso de Nivel</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nivel {user.level}</span>
                <span>{user.xp} / {nextLevelXP} XP</span>
              </div>
              <Progress value={currentLevelProgress} className="h-2" />
              <p className="text-xs text-gray-500">
                {nextLevelXP - user.xp} XP para el siguiente nivel
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Completed Lessons */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {user.completedLessons?.length || 0}
            </div>
            <p className="text-sm text-gray-600">Lecciones Completadas</p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {user.streak}
            </div>
            <p className="text-sm text-gray-600">Días de Racha</p>
          </CardContent>
        </Card>

        {/* Badges Count */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {user.badges.length}
            </div>
            <p className="text-sm text-gray-600">Logros Obtenidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Achievements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span>Tus Logros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {user.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Obtenido el {formatDate(badge.earnedAt)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Upcoming Achievements */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                <div className="text-3xl">🔥</div>
                <div>
                  <div className="font-semibold text-gray-600">Racha de Fuego</div>
                  <div className="text-sm text-gray-500">Mantén una racha de 10 días</div>
                  <div className="text-xs text-gray-400 mt-1">Próximo logro</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                <div className="text-3xl">🎯</div>
                <div>
                  <div className="font-semibold text-gray-600">Explorador</div>
                  <div className="text-sm text-gray-500">Completa 10 lecciones</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.max(0, 10 - (user.completedLessons?.length || 0))} lecciones restantes
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Clasificación</span>
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
                  <div className="flex items-center space-x-3">
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
                    <span className={`font-medium text-sm ${
                      entry.name === user.name ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-sm">{entry.xp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <span>Información de la Cuenta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Registro</label>
              <p className="text-lg">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Última Actividad</label>
              <p className="text-lg">{formatDate(user.lastActiveDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
