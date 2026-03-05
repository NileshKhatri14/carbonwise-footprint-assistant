import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateEmissions } from '@/lib/carbonEngine';
import { saveActivity, saveEmission } from '@/lib/storage';
import { setOnboarded } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Leaf, Car, Zap, UtensilsCrossed, ShoppingBag, Plane, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    transportType: 'petrol',
    transportDistance: '',
    energyConsumption: '',
    dietType: 'omnivore',
    mealsPerDay: '3',
    shoppingFrequency: 'medium',
    vacationMode: 'none',
    vacationDistance: '',
  });

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUserName(user.user_metadata?.display_name || user.email || 'User');
      setLoading(false);
    };
    check();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const steps = [
    {
      icon: Car,
      title: 'Daily Transportation',
      color: 'gradient-card-blue',
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
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
            <Label>Monthly Distance (km)</Label>
            <Input type="number" placeholder="e.g. 500" value={form.transportDistance} onChange={e => setForm(f => ({ ...f, transportDistance: e.target.value }))} />
          </div>
        </div>
      ),
    },
    {
      icon: Plane,
      title: 'Vacation Travel',
      color: 'gradient-card-purple',
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mode of Vacation Travel</Label>
            <Select value={form.vacationMode} onValueChange={v => setForm(f => ({ ...f, vacationMode: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Vacation Travel</SelectItem>
                <SelectItem value="flight">Flight ✈️</SelectItem>
                <SelectItem value="train">Train 🚆</SelectItem>
                <SelectItem value="bus">Bus 🚌</SelectItem>
                <SelectItem value="car">Car 🚗</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.vacationMode !== 'none' && (
            <div className="space-y-2">
              <Label>Round-trip Distance (km)</Label>
              <Input type="number" placeholder="e.g. 2000" value={form.vacationDistance} onChange={e => setForm(f => ({ ...f, vacationDistance: e.target.value }))} />
            </div>
          )}
        </div>
      ),
    },
    {
      icon: Zap,
      title: 'Energy Usage',
      color: 'gradient-card-amber',
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Monthly Electricity Usage (kWh)</Label>
            <Input type="number" placeholder="e.g. 150" value={form.energyConsumption} onChange={e => setForm(f => ({ ...f, energyConsumption: e.target.value }))} />
          </div>
        </div>
      ),
    },
    {
      icon: UtensilsCrossed,
      title: 'Food Habits',
      color: 'gradient-card-green',
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Diet Type</Label>
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
            <Label>Meals per Day</Label>
            <Input type="number" min="1" max="6" value={form.mealsPerDay} onChange={e => setForm(f => ({ ...f, mealsPerDay: e.target.value }))} />
          </div>
        </div>
      ),
    },
    {
      icon: ShoppingBag,
      title: 'Shopping Behavior',
      color: 'gradient-card-blue',
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Shopping Frequency</Label>
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
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (submitting) return;
      setSubmitting(true);
      const activity = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        transportType: form.transportType,
        transportDistance: Number(form.transportDistance) || 0,
        energyConsumption: Number(form.energyConsumption) || 0,
        dietType: form.dietType,
        mealsPerDay: Number(form.mealsPerDay) || 3,
        shoppingFrequency: form.shoppingFrequency,
        vacationMode: form.vacationMode,
        vacationDistance: Number(form.vacationDistance) || 0,
      };
      const activityId = await saveActivity(activity);
      if (activityId) {
        const emissionData = calculateEmissions(activity);
        await saveEmission({ activityId, ...emissionData });
      }
      await setOnboarded();
      toast.success('Activity logged! Welcome to your dashboard.');
      navigate('/dashboard');
    }
  };

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-primary-foreground text-lg">CarbonWise</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-foreground">
            Hi {userName}! Let's get started 👋
          </h1>
          <p className="text-primary-foreground/60 text-sm mt-1">Tell us about your lifestyle to calculate your carbon footprint</p>
        </div>

        <div className="flex gap-2 px-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'gradient-primary' : 'bg-primary-foreground/20'}`} />
          ))}
        </div>

        <Card className="p-8 shadow-elevated" key={step}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl ${current.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</p>
              <h2 className="text-xl font-display font-semibold">{current.title}</h2>
            </div>
          </div>

          {current.fields}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            ) : <div />}
            <Button onClick={handleNext} className="gradient-primary text-primary-foreground font-semibold gap-2">
              {step < steps.length - 1 ? (
                <>Next <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>View Dashboard <Sparkles className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
