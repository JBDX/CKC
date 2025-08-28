import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { useLocation } from "wouter";

export default function Login() {
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherId.trim() || !password.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(teacherId, password);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        setLocation("/score-entry");
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto" data-testid="login-form">
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Connexion Enseignant</h2>
            <p className="text-muted-foreground mt-2">Accédez au système de saisie des points</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="teacherId" className="block text-sm font-medium text-card-foreground mb-2">
                Identifiant
              </Label>
              <Input
                type="text"
                id="teacherId"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="Votre identifiant"
                disabled={isLoading}
                data-testid="input-teacher-id"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Mot de passe
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                disabled={isLoading}
                data-testid="input-password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit-login"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
