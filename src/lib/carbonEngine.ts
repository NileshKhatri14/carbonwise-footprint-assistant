// Emission factors (kg CO2)
export const EMISSION_FACTORS = {
  transport: {
    petrol: 0.192,    // per km
    diesel: 0.171,    // per km
    hybrid: 0.109,    // per km
    lpg: 0.165,       // per km
    electric: 0.053,  // per km
    public: 0.089,    // per km
    bicycle: 0,
    walk: 0,
  },
  vacation: {
    flight: 0.255,    // per km
    train: 0.041,     // per km
    bus: 0.089,       // per km
    car: 0.192,       // per km
    none: 0,
  },
  energy: 0.475,       // per kWh
  food: {
    'non-vegetarian': 3.0,  // per meal
    omnivore: 2.5,
    pescatarian: 1.8,
    mixed: 2.0,
    vegetarian: 1.2,
    vegan: 0.7,
  },
  shopping: {
    low: 5,     // kg CO2/month
    medium: 15,
    high: 30,
    'very high': 50,
  },
} as const;

export interface Activity {
  id?: string;
  date: string;
  transportType: string;
  transportDistance: number;
  energyConsumption: number;
  dietType: string;
  mealsPerDay: number;
  shoppingFrequency: string;
  vacationMode: string;
  vacationDistance: number;
}

export interface Emission {
  id: string;
  activityId: string;
  date: string;
  transportEmission: number;
  energyEmission: number;
  foodEmission: number;
  shoppingEmission: number;
  vacationEmission: number;
  totalEmission: number;
}

export interface UserProfile {
  name: string;
  email: string;
  points: number;
  badges: string[];
  joinedDate: string;
}

export function calculateEmissions(activity: Activity): Omit<Emission, 'id' | 'activityId'> {
  const transportFactor = EMISSION_FACTORS.transport[activity.transportType as keyof typeof EMISSION_FACTORS.transport] || 0.192;
  const transportEmission = activity.transportDistance * transportFactor;

  const energyEmission = activity.energyConsumption * EMISSION_FACTORS.energy;

  const foodFactor = EMISSION_FACTORS.food[activity.dietType as keyof typeof EMISSION_FACTORS.food] || 2.0;
  const foodEmission = foodFactor * activity.mealsPerDay * 30; // monthly

  const shoppingEmission = EMISSION_FACTORS.shopping[activity.shoppingFrequency as keyof typeof EMISSION_FACTORS.shopping] || 15;

  const vacationFactor = EMISSION_FACTORS.vacation[activity.vacationMode as keyof typeof EMISSION_FACTORS.vacation] || 0;
  const vacationEmission = (activity.vacationDistance || 0) * vacationFactor;

  const totalEmission = transportEmission + energyEmission + foodEmission + shoppingEmission + vacationEmission;

  return {
    date: activity.date,
    transportEmission: Math.round(transportEmission * 100) / 100,
    energyEmission: Math.round(energyEmission * 100) / 100,
    foodEmission: Math.round(foodEmission * 100) / 100,
    shoppingEmission: Math.round(shoppingEmission * 100) / 100,
    vacationEmission: Math.round(vacationEmission * 100) / 100,
    totalEmission: Math.round(totalEmission * 100) / 100,
  };
}

// Simple linear regression implementation
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const yMean = sumY / n;
  const ssRes = y.reduce((acc, yi, i) => acc + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const ssTot = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope: Math.round(slope * 100) / 100, intercept: Math.round(intercept * 100) / 100, r2: Math.round(r2 * 1000) / 1000 };
}

export function predictEmissions(emissions: Emission[]): {
  predictedMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  featureImportance: { feature: string; impact: number }[];
  predictions: { month: number; value: number }[];
} {
  if (emissions.length < 2) {
    const latest = emissions[0]?.totalEmission || 0;
    return {
      predictedMonthly: latest,
      trend: 'stable',
      featureImportance: [],
      predictions: [],
    };
  }

  const x = emissions.map((_, i) => i);
  const y = emissions.map(e => e.totalEmission);
  const { slope, intercept } = linearRegression(x, y);

  const nextMonths = [0, 1, 2, 3].map(m => ({
    month: emissions.length + m,
    value: Math.max(0, Math.round((slope * (emissions.length + m) + intercept) * 100) / 100),
  }));

  const trend = slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable';

  // Feature importance via correlation
  const features = [
    { feature: 'Transport', values: emissions.map(e => e.transportEmission) },
    { feature: 'Energy', values: emissions.map(e => e.energyEmission) },
    { feature: 'Food', values: emissions.map(e => e.foodEmission) },
    { feature: 'Shopping', values: emissions.map(e => e.shoppingEmission) },
    { feature: 'Vacation', values: emissions.map(e => e.vacationEmission || 0) },
  ];

  const totalMean = y.reduce((a, b) => a + b, 0) / y.length;
  const featureImportance = features.map(f => {
    const mean = f.values.reduce((a, b) => a + b, 0) / f.values.length;
    return { feature: f.feature, impact: Math.round((mean / totalMean) * 100) };
  }).sort((a, b) => b.impact - a.impact);

  return {
    predictedMonthly: nextMonths[0]?.value || 0,
    trend,
    featureImportance,
    predictions: nextMonths,
  };
}

export function generateRecommendations(emissions: Emission[]): {
  title: string;
  description: string;
  potentialReduction: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
}[] {
  if (emissions.length === 0) return [];

  const latest = emissions[emissions.length - 1];
  const recs: ReturnType<typeof generateRecommendations> = [];

  if (latest.transportEmission > 50) {
    recs.push({
      title: 'Switch to Public Transport',
      description: 'Using public transport instead of private vehicles can reduce your transport emissions by up to 65%.',
      potentialReduction: Math.round(latest.transportEmission * 0.55),
      category: 'transport',
      priority: 'high',
    });
    recs.push({
      title: 'Try Cycling or Walking',
      description: 'For short distances under 5km, consider cycling or walking to eliminate emissions entirely.',
      potentialReduction: Math.round(latest.transportEmission * 0.2),
      category: 'transport',
      priority: 'medium',
    });
  }

  if (latest.energyEmission > 30) {
    recs.push({
      title: 'Use Energy-Efficient Appliances',
      description: 'Switching to Energy Star rated appliances can cut electricity usage by 30-50%.',
      potentialReduction: Math.round(latest.energyEmission * 0.35),
      category: 'energy',
      priority: 'high',
    });
    recs.push({
      title: 'Install LED Lighting',
      description: 'LED bulbs use 75% less energy than incandescent lighting.',
      potentialReduction: Math.round(latest.energyEmission * 0.1),
      category: 'energy',
      priority: 'low',
    });
  }

  if (latest.foodEmission > 60) {
    recs.push({
      title: 'Reduce Meat Consumption',
      description: 'Having 2-3 meatless days per week can significantly lower your food carbon footprint.',
      potentialReduction: Math.round(latest.foodEmission * 0.3),
      category: 'food',
      priority: 'high',
    });
  }

  if (latest.shoppingEmission > 20) {
    recs.push({
      title: 'Buy Sustainable Products',
      description: 'Choose products with eco-labels and minimal packaging to reduce shopping emissions.',
      potentialReduction: Math.round(latest.shoppingEmission * 0.25),
      category: 'shopping',
      priority: 'medium',
    });
  }

  // Always add offset suggestion
  recs.push({
    title: 'Plant Trees to Offset',
    description: `Plant ${Math.ceil(latest.totalEmission / 22)} trees to offset your current monthly emissions. Each tree absorbs ~22kg CO2/year.`,
    potentialReduction: Math.round(latest.totalEmission * 0.15),
    category: 'offset',
    priority: 'medium',
  });

  return recs.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return p[b.priority] - p[a.priority];
  });
}

// Gamification
export const BADGES = [
  { id: 'first_log', name: 'First Step', description: 'Log your first activity', icon: '🌱', threshold: 1 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Log activities for 7 days', icon: '🔥', threshold: 7 },
  { id: 'reducer', name: 'Carbon Reducer', description: 'Reduce emissions by 10%', icon: '📉', threshold: 10 },
  { id: 'green_diet', name: 'Green Eater', description: 'Log 5 vegetarian/vegan meals', icon: '🥦', threshold: 5 },
  { id: 'cyclist', name: 'Pedal Power', description: 'Choose cycling 10 times', icon: '🚲', threshold: 10 },
  { id: 'centurion', name: 'Centurion', description: 'Earn 100 green points', icon: '💯', threshold: 100 },
] as const;

export function calculatePoints(emissions: Emission[]): number {
  if (emissions.length < 2) return emissions.length * 10;
  let points = emissions.length * 10; // base points for logging
  // Bonus for reducing
  for (let i = 1; i < emissions.length; i++) {
    if (emissions[i].totalEmission < emissions[i - 1].totalEmission) {
      points += 15;
    }
  }
  return points;
}

export function getEarnedBadges(activities: Activity[], emissions: Emission[]): string[] {
  const earned: string[] = [];
  if (activities.length >= 1) earned.push('first_log');
  if (activities.length >= 7) earned.push('week_streak');
  if (emissions.length >= 2) {
    const first = emissions[0].totalEmission;
    const last = emissions[emissions.length - 1].totalEmission;
    if (last < first * 0.9) earned.push('reducer');
  }
  const vegCount = activities.filter(a => ['vegetarian', 'vegan'].includes(a.dietType)).length;
  if (vegCount >= 5) earned.push('green_diet');
  const cycleCount = activities.filter(a => a.transportType === 'bicycle' || a.transportType === 'walk').length;
  if (cycleCount >= 10) earned.push('cyclist');
  if (calculatePoints(emissions) >= 100) earned.push('centurion');
  return earned;
}

// Carbon offset calculations
export function calculateOffsets(totalEmission: number) {
  return [
    {
      action: 'Plant Trees',
      description: `Plant ${Math.ceil(totalEmission / 22)} trees (each absorbs ~22kg CO2/year)`,
      trees: Math.ceil(totalEmission / 22),
      icon: '🌳',
    },
    {
      action: 'Renewable Energy Credits',
      description: `Purchase ${Math.ceil(totalEmission / 0.4)} kWh of renewable energy credits`,
      amount: Math.ceil(totalEmission / 0.4),
      icon: '⚡',
    },
    {
      action: 'Carbon Credits',
      description: `Buy ${(totalEmission / 1000).toFixed(2)} tonnes of verified carbon credits (~$${Math.round(totalEmission * 0.015)})`,
      cost: Math.round(totalEmission * 0.015),
      icon: '📜',
    },
  ];
}
