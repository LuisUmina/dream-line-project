import React from 'react';
import { Trophy, Flame, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { state } = useAppContext();
  const user = state.user;

  if (!user) return null;

  return (
    <header className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">CodeLingo</h1>
              <p className="text-green-100 text-xs sm:text-sm">¡Aprende programación!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Card className="bg-white/10 border-white/20 px-2 py-1 sm:px-3 sm:py-2">
              <div className="flex items-center space-x-2 text-white">
                <Flame className="h-4 w-4 text-orange-300" />
                <span className="font-bold text-sm sm:text-lg">{user.streak}</span>
                <span className="text-xs sm:text-sm">racha</span>
              </div>
            </Card>
            
            <Card className="bg-white/10 border-white/20 px-2 py-1 sm:px-3 sm:py-2">
              <div className="flex items-center space-x-2 text-white">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="font-bold text-sm sm:text-lg">{user.xp}</span>
                <span className="text-xs sm:text-sm">XP</span>
              </div>
            </Card>
            
            <div className="text-center sm:text-right">
              <p className="font-semibold text-sm sm:text-base">{user.name}</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Nivel {user.level}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}