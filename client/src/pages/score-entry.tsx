import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Team } from "@shared/schema";

// Predefined actions with points
const ADD_POINTS_ACTIONS = [
  { action: "emprunter un livre au CDI", points: 50 },
  { action: "aucun oubli sur une semaine", points: 10 },
  { action: "comportement positif sur une semaine", points: 10 },
  { action: "résolution de conflit", points: 50 },
  { action: "effort sur le trimestre", points: 100 },
  { action: "gagne un défi versus un enseignant", points: 50 },
  { action: "carnet à jour", points: 10 },
  { action: "entraide entre élèves", points: 50 },
  { action: "écrire un message Arsène sans fautes d'orthographe", points: 10 },
  { action: "meilleur cookie", points: 200 },
  { action: "gouter d'anniversaire", points: 50 }
];

const REMOVE_POINTS_ACTIONS = [
  { action: "oubli (travail, livre, tenue)", points: -50 },
  { action: "comportement (insolence, attitude, etc)", points: -100 },
  { action: "violence", points: -100 },
  { action: "refuser d'essayer", points: -50 },
  { action: "carnet non à jour", points: -50 },
  { action: "perds le défi contre un enseignant", points: -50 },
  { action: "écrire un message Arsène avec des fautes d'orthographe", points: -10 }
];

export default function ScoreEntry() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedAction, setSelectedAction] = useState<{action: string, points: number} | null>(null);
  const { teacher, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const scoreEntryMutation = useMutation({
    mutationFn: async (data: { teamId: string; teacherId: string; action: string; points: number }) => {
      return await apiRequest("POST", "/api/score-entries", data);
    },
    onSuccess: async () => {
      // Invalidate and refetch teams data
      await queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/recent-activities'] });
      
      toast({
        title: "Succès",
        description: "Score bien saisi !",
      });
      
      // Reset form
      setSelectedTeam("");
      setSelectedAction(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeam || !selectedAction) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une équipe et une action",
        variant: "destructive",
      });
      return;
    }

    if (!teacher) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive",
      });
      return;
    }

    scoreEntryMutation.mutate({
      teamId: selectedTeam,
      teacherId: teacher.id,
      action: selectedAction.action,
      points: selectedAction.points,
    });
  };

  const getTeamColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'orange':
        return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'cyan':
        return { bg: 'bg-cyan-100', text: 'text-cyan-600' };
      case 'yellow':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="score-entry-loading">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Saisie des Points</h2>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="score-entry-form">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Saisie des Points</h2>
        <p className="text-muted-foreground">Gestion des points d'équipe</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Selection */}
              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-3">
                  Choix de l'équipe
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teams?.map((team) => {
                    const colorClasses = getTeamColorClasses(team.color);
                    return (
                      <div key={team.id} className="relative">
                        <input
                          type="radio"
                          id={`team-${team.id}`}
                          name="team"
                          value={team.id}
                          checked={selectedTeam === team.id}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          className="sr-only peer"
                          data-testid={`radio-team-${team.id}`}
                        />
                        <label
                          htmlFor={`team-${team.id}`}
                          className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-accent peer-checked:border-primary peer-checked:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className={`w-10 h-10 ${colorClasses.bg} rounded-full flex items-center justify-center`}>
                              <i className={`${team.icon} ${colorClasses.text}`}></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-card-foreground">
                                {team.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {team.members.join(', ')}
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Action Display */}
              {selectedAction && (
                <div className="bg-accent p-4 rounded-lg">
                  <Label className="block text-sm font-medium text-card-foreground mb-2">
                    Action sélectionnée
                  </Label>
                  <div className="flex justify-between items-center">
                    <span className="text-card-foreground font-medium">{selectedAction.action}</span>
                    <span className={`text-lg font-bold ${selectedAction.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {selectedAction.points >= 0 ? '+' : ''}{selectedAction.points} points
                    </span>
                  </div>
                </div>
              )}

              {/* Add Points Actions */}
              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-3">
                  <i className="fas fa-plus text-emerald-600 mr-2"></i>
                  Actions qui ajoutent des points
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {ADD_POINTS_ACTIONS.map((actionItem, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAction(actionItem)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedAction?.action === actionItem.action
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-border hover:bg-accent'
                      }`}
                      data-testid={`action-add-${index}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{actionItem.action}</span>
                        <span className="text-emerald-600 font-semibold">+{actionItem.points}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Remove Points Actions */}
              <div>
                <Label className="block text-sm font-medium text-card-foreground mb-3">
                  <i className="fas fa-minus text-red-600 mr-2"></i>
                  Actions qui retirent des points
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {REMOVE_POINTS_ACTIONS.map((actionItem, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAction(actionItem)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedAction?.action === actionItem.action
                          ? 'border-red-500 bg-red-50'
                          : 'border-border hover:bg-accent'
                      }`}
                      data-testid={`action-remove-${index}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{actionItem.action}</span>
                        <span className="text-red-600 font-semibold">{actionItem.points}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={scoreEntryMutation.isPending}
                  data-testid="button-submit-score"
                >
                  <i className="fas fa-save mr-2"></i>
                  {scoreEntryMutation.isPending ? "Sauvegarde..." : "Valider la saisie"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  data-testid="button-view-scores"
                >
                  Voir scores
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
