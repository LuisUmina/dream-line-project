import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/services/auth';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

export function RegistrationModal({ 
  isOpen, 
  onClose, 
  onSwitchToLogin,
  onSwitchToDashboard
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSwitchToLogin: () => void;
  onSwitchToDashboard: () => void;
}) {
  const { setUser } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
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
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { user, error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error || !user) {
        setError(error || 'Error al registrarse');
        toast({
          title: "Error de registro",
          description: error || 'No se pudo crear la cuenta. Inténtalo de nuevo.',
          variant: "destructive",
        });
        return;
      }
      
      setUser(user);
      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido a PanaSkill, ${user.name}`,
      });
      onClose();
      onSwitchToDashboard(); // Redirect to dashboard
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Registrarse</DialogTitle>
          <DialogDescription className="text-center">
            Crea una cuenta para comenzar tu aventura de aprendizaje
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ingresa tu nombre completo"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Crea una contraseña segura"
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
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión aquí
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
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
