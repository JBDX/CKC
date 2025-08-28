import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { ScoreEntryWithTeam } from "@shared/schema";

export function RecentActivities() {
  const { data: activities, isLoading } = useQuery<ScoreEntryWithTeam[]>({
    queryKey: ['/api/recent-activities'],
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">Activités Récentes</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">Activités Récentes</h3>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Aucune activité récente</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-foreground mb-4">Activités Récentes</h3>
      <Card>
        <CardContent className="p-0">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-4 ${index < activities.length - 1 ? 'border-b border-border' : ''}`}
              data-testid={`activity-${activity.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${activity.points >= 0 ? 'bg-emerald-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                    <i className={`fas fa-${activity.points >= 0 ? 'plus' : 'minus'} ${activity.points >= 0 ? 'text-emerald-600' : 'text-red-600'} text-sm`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground" data-testid={`text-activity-action-${activity.id}`}>
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-activity-team-${activity.id}`}>
                      {activity.team.name} • {formatTimeAgo(activity.timestamp.toString())}
                    </p>
                  </div>
                </div>
                <span 
                  className={`text-lg font-semibold ${activity.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  data-testid={`text-activity-points-${activity.id}`}
                >
                  {activity.points >= 0 ? '+' : ''}{activity.points}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
