import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/services/auth';
import { toast } from '@/hooks/use-toast';

export function PasswordResetModal({ 
  isOpen, 
  onClose,
  onSwitchToLogin
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { success, error } = await resetPassword(email);
      
      if (error || !success) {
        setError(error || 'Error al enviar el correo de restablecimiento.');
        toast({
          title: "Error",
          description: error || 'No se pudo enviar el correo de restablecimiento.',
          variant: "destructive",
        });
        return;
      }
      
      setIsSuccess(true);
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un enlace para restablecer tu contraseña.",
      });
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Recuperar Contraseña</DialogTitle>
          <DialogDescription className="text-center">
            Ingresa tu correo electrónico para recibir un enlace de restablecimiento
          </DialogDescription>
        </DialogHeader>
        
        {!isSuccess ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
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
                ¿Recordaste tu contraseña?{' '}
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
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <p className="font-medium">¡Correo enviado!</p>
              <p className="text-sm mt-1">Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
            </div>
            
            <DialogFooter>
              <Button onClick={onClose}>Cerrar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
