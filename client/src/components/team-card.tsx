import { Card, CardContent } from "@/components/ui/card";
import type { TeamWithRecentChange } from "@shared/schema";

interface TeamCardProps {
  team: TeamWithRecentChange;
}

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

export function TeamCard({ team }: TeamCardProps) {
  const colorClasses = getTeamColorClasses(team.color);
  const isPositiveChange = team.recentChange >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-team-${team.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center`}>
              <i className={`${team.icon} ${colorClasses.text} text-xl`}></i>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground" data-testid={`text-team-name-${team.id}`}>
                {team.name}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-team-members-${team.id}`}>
                {team.members.join(', ')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary" data-testid={`text-team-score-${team.id}`}>
              {team.totalScore.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Points Total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-1">
              <span 
                className={`text-lg font-semibold ${isPositiveChange ? 'text-emerald-600' : 'text-red-600'}`}
                data-testid={`text-team-change-${team.id}`}
              >
                {isPositiveChange ? '+' : ''}{team.recentChange}
              </span>
              <i className={`fas fa-arrow-${isPositiveChange ? 'up' : 'down'} ${isPositiveChange ? 'text-emerald-600' : 'text-red-600'}`}></i>
            </div>
            <p className="text-sm text-muted-foreground">Cette semaine</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
