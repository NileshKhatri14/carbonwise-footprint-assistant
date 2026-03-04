import { Emission } from '@/lib/carbonEngine';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, Area, AreaChart } from 'recharts';

interface Props {
  emissions: Emission[];
  predictions: { month: number; value: number }[];
}

const COLORS = ['hsl(152,58%,38%)', 'hsl(38,92%,50%)', 'hsl(200,70%,50%)', 'hsl(280,60%,55%)', 'hsl(340,65%,50%)'];

export default function EmissionCharts({ emissions, predictions }: Props) {
  if (emissions.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <p className="text-muted-foreground">Log activities to see your emission charts.</p>
      </Card>
    );
  }

  // Only use the latest entry
  const latest = emissions[emissions.length - 1];

  const barData = [
    { name: 'Transport', value: latest.transportEmission, fill: COLORS[0] },
    { name: 'Energy', value: latest.energyEmission, fill: COLORS[1] },
    { name: 'Food', value: latest.foodEmission, fill: COLORS[2] },
    { name: 'Shopping', value: latest.shoppingEmission, fill: COLORS[3] },
    { name: 'Vacation', value: latest.vacationEmission || 0, fill: COLORS[4] },
  ].filter(d => d.value > 0);

  const pieData = barData;

  // Trend uses all entries + predictions
  const trendData = emissions.map((e, i) => ({
    name: `Entry ${i + 1}`,
    actual: e.totalEmission,
  }));
  const predData = predictions.map((p, i) => ({
    name: `Pred ${i + 1}`,
    predicted: p.value,
  }));
  const combinedTrend = [...trendData, ...predData];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Latest Entry Breakdown */}
      <Card className="p-5 shadow-card">
        <h3 className="text-base font-display font-semibold mb-4">Your Emission Breakdown (kg CO₂)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,15%,88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie Chart - Latest Entry Distribution */}
      <Card className="p-5 shadow-card">
        <h3 className="text-base font-display font-semibold mb-4">Your Emission Distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Trend Line + Predictions */}
      <Card className="p-5 shadow-card lg:col-span-2">
        <h3 className="text-base font-display font-semibold mb-4">Emission Trend & Predictions</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={combinedTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,15%,88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="actual" stroke="hsl(152,58%,38%)" fill="hsl(152,58%,38%)" fillOpacity={0.15} strokeWidth={2} dot />
            <Area type="monotone" dataKey="predicted" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.1} strokeWidth={2} strokeDasharray="6 4" dot />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
