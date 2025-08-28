import { useQuery } from "@tanstack/react-query";
import { TeamCard } from "@/components/team-card";
import { RecentActivities } from "@/components/recent-activities";
import type { TeamWithRecentChange } from "@shared/schema";

export default function Home() {
  const { data: teams, isLoading } = useQuery<TeamWithRecentChange[]>({
    queryKey: ['/api/teams'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="home-loading">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Tableau des Scores</h2>
          <p className="text-muted-foreground">Scores actuels des équipes avec évolution</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-12 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="space-y-6" data-testid="home-empty">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Tableau des Scores</h2>
          <p className="text-muted-foreground">Aucune équipe trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="home-content">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Tableau des Scores</h2>
        <p className="text-muted-foreground">Scores actuels des équipes avec évolution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      <RecentActivities />
    </div>
  );
}
