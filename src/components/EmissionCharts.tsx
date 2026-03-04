import { Emission } from '@/lib/carbonEngine';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Area, AreaChart } from 'recharts';

interface Props {
  emissions: Emission[];
  predictions: { month: number; value: number }[];
}

const COLORS = ['hsl(152,58%,38%)', 'hsl(38,92%,50%)', 'hsl(200,70%,50%)', 'hsl(280,60%,55%)'];

export default function EmissionCharts({ emissions, predictions }: Props) {
  if (emissions.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <p className="text-muted-foreground">Log activities to see your emission charts.</p>
      </Card>
    );
  }

  const latest = emissions[emissions.length - 1];
  const pieData = [
    { name: 'Transport', value: latest.transportEmission },
    { name: 'Energy', value: latest.energyEmission },
    { name: 'Food', value: latest.foodEmission },
    { name: 'Shopping', value: latest.shoppingEmission },
  ].filter(d => d.value > 0);

  const barData = emissions.map((e, i) => ({
    name: `Entry ${i + 1}`,
    Transport: e.transportEmission,
    Energy: e.energyEmission,
    Food: e.foodEmission,
    Shopping: e.shoppingEmission,
  }));

  const trendData = emissions.map((e, i) => ({
    name: `Entry ${i + 1}`,
    actual: e.totalEmission,
  }));

  // Add predictions
  const predData = predictions.map((p, i) => ({
    name: `Pred ${i + 1}`,
    predicted: p.value,
  }));

  const combinedTrend = [...trendData, ...predData];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Category Emissions */}
      <Card className="p-5 shadow-card">
        <h3 className="text-base font-display font-semibold mb-4">Category Emissions (kg CO₂)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,15%,88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Transport" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Energy" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Food" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Shopping" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie Chart - Distribution */}
      <Card className="p-5 shadow-card">
        <h3 className="text-base font-display font-semibold mb-4">Latest Emission Distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
