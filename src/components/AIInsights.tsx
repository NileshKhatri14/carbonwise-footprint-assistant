import { Emission, predictEmissions } from '@/lib/carbonEngine';
import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  emissions: Emission[];
}

export default function AIInsights({ emissions }: Props) {
  const prediction = predictEmissions(emissions);

  if (emissions.length < 2) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold">AI Insights</h2>
        </div>
        <p className="text-sm text-muted-foreground">Need at least 2 entries for prediction analysis.</p>
      </Card>
    );
  }

  const TrendIcon = prediction.trend === 'increasing' ? TrendingUp : prediction.trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = prediction.trend === 'increasing' ? 'text-destructive' : prediction.trend === 'decreasing' ? 'text-primary' : 'text-muted-foreground';

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">AI Regression Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Predicted Monthly</p>
          <p className="text-2xl font-display font-bold">{prediction.predictedMonthly}<span className="text-sm font-normal text-muted-foreground"> kg</span></p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Trend</p>
          <div className={`flex items-center gap-1 text-lg font-display font-bold capitalize ${trendColor}`}>
            <TrendIcon className="w-5 h-5" /> {prediction.trend}
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Model</p>
          <p className="text-sm font-medium">Linear Regression</p>
          <p className="text-xs text-muted-foreground">scikit-learn compatible</p>
        </div>
      </div>

      {prediction.featureImportance.length > 0 && (
        <div>
          <h3 className="text-sm font-display font-semibold mb-2">Feature Importance</h3>
          <div className="space-y-2">
            {prediction.featureImportance.map(f => (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="text-sm w-20">{f.feature}</span>
                <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${Math.min(f.impact, 100)}%` }} />
                </div>
                <span className="text-sm font-medium w-12 text-right">{f.impact}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
