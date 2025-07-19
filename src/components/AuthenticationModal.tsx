import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/services/auth';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

export function AuthenticationModal({ 
  isOpen, 
  onClose, 
  onSwitchToRegister,
  onForgotPassword,
  onSwitchToDashboard
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onSwitchToDashboard: () => void;
}) {
  const { setUser } = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { user, error } = await signIn(formData.email, formData.password);
      
      if (error || !user) {
        setError(error || 'Error al iniciar sesión');
        toast({
          title: "Error de inicio de sesión",
          description: error || 'No se pudo iniciar sesión. Verifica tus credenciales.',
          variant: "destructive",
        });
        return;
      }
      
      setUser(user);
      toast({
        title: "¡Sesión iniciada!",
        description: `Bienvenido de vuelta, ${user.name}`,
      });
      onClose();
      onSwitchToDashboard(); // Redirect to dashboard
    } catch (err) {
      console.error('Login error:', err);
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Iniciar Sesión</DialogTitle>
          <DialogDescription className="text-center">
            Accede a tu cuenta para continuar tu aprendizaje
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  onForgotPassword();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
        </form>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-white text-black border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-white text-black border border-gray-300 hover:bg-gray-50"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
