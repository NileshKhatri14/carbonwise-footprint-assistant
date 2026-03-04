import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowDown, TrendingDown } from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  potentialReduction: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  recommendations: Recommendation[];
}

const priorityStyles = {
  high: 'border-l-4 border-l-destructive',
  medium: 'border-l-4 border-l-accent',
  low: 'border-l-4 border-l-primary',
};

const categoryIcons: Record<string, string> = {
  transport: '🚗',
  energy: '⚡',
  food: '🍽️',
  shopping: '🛍️',
  offset: '🌍',
};

export default function Recommendations({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <Lightbulb className="w-10 h-10 text-accent mx-auto mb-3" />
        <p className="text-muted-foreground">Log activities to receive personalized recommendations.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-semibold flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-accent" /> Personalized Recommendations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, i) => (
          <Card key={i} className={`p-5 shadow-card ${priorityStyles[rec.priority]} animate-fade-in`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <span>{categoryIcons[rec.category] || '💡'}</span>
                {rec.title}
              </h3>
              <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                {rec.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <TrendingDown className="w-4 h-4" />
              Potential reduction: {rec.potentialReduction} kg CO₂
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
