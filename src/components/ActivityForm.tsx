import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, calculateEmissions } from '@/lib/carbonEngine';
import { saveActivity, saveEmission } from '@/lib/storage';
import { toast } from 'sonner';
import { Car, Zap, UtensilsCrossed, ShoppingBag, Plus } from 'lucide-react';

interface Props {
  onActivityLogged: () => void;
}

export default function ActivityForm({ onActivityLogged }: Props) {
  const [form, setForm] = useState({
    transportType: 'petrol',
    transportDistance: '',
    energyConsumption: '',
    dietType: 'omnivore',
    mealsPerDay: '3',
    shoppingFrequency: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activity: Activity = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      transportType: form.transportType,
      transportDistance: Number(form.transportDistance) || 0,
      energyConsumption: Number(form.energyConsumption) || 0,
      dietType: form.dietType,
      mealsPerDay: Number(form.mealsPerDay) || 3,
      shoppingFrequency: form.shoppingFrequency,
    };

    saveActivity(activity);
    const emissionData = calculateEmissions(activity);
    saveEmission({ id: crypto.randomUUID(), activityId: activity.id, ...emissionData });
    toast.success('Activity logged! Emissions calculated.');
    onActivityLogged();
    setForm({ transportType: 'petrol', transportDistance: '', energyConsumption: '', dietType: 'omnivore', mealsPerDay: '3', shoppingFrequency: 'medium' });
  };

  return (
    <Card className="p-6 shadow-card">
      <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" /> Log Activity
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Transport */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Car className="w-4 h-4 text-chart-3" /> Vehicle Type
          </Label>
          <Select value={form.transportType} onValueChange={v => setForm(f => ({ ...f, transportType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol Car</SelectItem>
              <SelectItem value="diesel">Diesel Car</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="public">Public Transport</SelectItem>
              <SelectItem value="bicycle">Bicycle</SelectItem>
              <SelectItem value="walk">Walk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Monthly Distance (km)</Label>
          <Input type="number" placeholder="e.g. 500" value={form.transportDistance} onChange={e => setForm(f => ({ ...f, transportDistance: e.target.value }))} />
        </div>

        {/* Energy */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-accent" /> Electricity (kWh/month)
          </Label>
          <Input type="number" placeholder="e.g. 150" value={form.energyConsumption} onChange={e => setForm(f => ({ ...f, energyConsumption: e.target.value }))} />
        </div>

        {/* Food */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <UtensilsCrossed className="w-4 h-4 text-chart-5" /> Diet Type
          </Label>
          <Select value={form.dietType} onValueChange={v => setForm(f => ({ ...f, dietType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
              <SelectItem value="omnivore">Omnivore</SelectItem>
              <SelectItem value="pescatarian">Pescatarian</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Meals per Day</Label>
          <Input type="number" min="1" max="6" value={form.mealsPerDay} onChange={e => setForm(f => ({ ...f, mealsPerDay: e.target.value }))} />
        </div>

        {/* Shopping */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="w-4 h-4 text-chart-4" /> Shopping Frequency
          </Label>
          <Select value={form.shoppingFrequency} onValueChange={v => setForm(f => ({ ...f, shoppingFrequency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="very high">Very High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold text-base py-3">
            Log Activity & Calculate Emissions
          </Button>
        </div>
      </form>
    </Card>
  );
}
