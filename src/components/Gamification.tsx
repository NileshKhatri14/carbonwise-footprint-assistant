import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BADGES, calculatePoints } from '@/lib/carbonEngine';
import { Emission } from '@/lib/carbonEngine';
import { Trophy, Star, Target } from 'lucide-react';

interface Props {
  earnedBadges: string[];
  emissions: Emission[];
}

export default function Gamification({ earnedBadges, emissions }: Props) {
  const points = calculatePoints(emissions);
  const nextMilestone = Math.ceil(points / 50) * 50;
  const progress = (points / nextMilestone) * 100;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-semibold flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" /> Green Points & Badges
      </h2>

      {/* Points & Progress */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{points}</p>
              <p className="text-sm text-muted-foreground">Green Points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="w-4 h-4" /> Next: {nextMilestone} pts
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
      </Card>

      {/* Badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {BADGES.map(badge => {
          const earned = earnedBadges.includes(badge.id);
          return (
            <Card key={badge.id} className={`p-4 text-center shadow-card transition-all ${earned ? 'ring-2 ring-primary' : 'opacity-50 grayscale'}`}>
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-xs font-display font-semibold">{badge.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
