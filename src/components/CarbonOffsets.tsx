import { Card } from '@/components/ui/card';
import { calculateOffsets } from '@/lib/carbonEngine';
import { TreePine } from 'lucide-react';

interface Props {
  totalEmission: number;
}

export default function CarbonOffsets({ totalEmission }: Props) {
  const offsets = calculateOffsets(totalEmission);

  if (totalEmission === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-semibold flex items-center gap-2">
        <TreePine className="w-5 h-5 text-primary" /> Carbon Offset Suggestions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offsets.map((offset, i) => (
          <Card key={i} className="p-5 shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="text-3xl mb-3">{offset.icon}</div>
            <h3 className="font-display font-semibold mb-1">{offset.action}</h3>
            <p className="text-sm text-muted-foreground">{offset.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
