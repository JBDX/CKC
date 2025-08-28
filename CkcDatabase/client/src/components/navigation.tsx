import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth, authService } from "@/lib/auth";
import { useLocation } from "wouter";

export function Navigation() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleLogout = () => {
    authService.logout();
    setLocation("/");
  };

  const handleViewScores = () => {
    setLocation("/");
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary" data-testid="app-title">CKC</h1>
            </div>
            <div className="hidden md:block">
              <span className="text-muted-foreground">Système de Points d'Équipe</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleViewScores}
              className="text-primary hover:text-primary/80"
              data-testid="button-view-scores"
            >
              <i className="fas fa-chart-bar mr-2"></i>
              Voir les Scores
            </Button>
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="destructive"
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Déconnexion
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                data-testid="button-login"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
