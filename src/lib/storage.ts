import { supabase } from '@/integrations/supabase/client';
import { Activity, Emission, calculateEmissions } from './carbonEngine';

export async function getActivities(): Promise<Activity[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (!data) return [];
  return data.map(row => ({
    id: row.id,
    date: row.date,
    transportType: row.transport_type,
    transportDistance: Number(row.transport_distance),
    energyConsumption: Number(row.energy_consumption),
    dietType: row.diet_type,
    mealsPerDay: row.meals_per_day,
    shoppingFrequency: row.shopping_frequency,
    vacationMode: row.vacation_mode,
    vacationDistance: Number(row.vacation_distance),
  }));
}

export async function saveActivity(activity: Activity): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('activities').insert({
    user_id: user.id,
    date: activity.date,
    transport_type: activity.transportType,
    transport_distance: activity.transportDistance,
    energy_consumption: activity.energyConsumption,
    diet_type: activity.dietType,
    meals_per_day: activity.mealsPerDay,
    shopping_frequency: activity.shoppingFrequency,
    vacation_mode: activity.vacationMode,
    vacation_distance: activity.vacationDistance,
  }).select('id').single();
  if (error) { console.error('saveActivity error:', error); return null; }
  return data?.id || null;
}

export async function getEmissions(): Promise<Emission[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('emissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (!data) return [];
  return data.map(row => ({
    id: row.id,
    activityId: row.activity_id,
    date: row.date,
    transportEmission: Number(row.transport_emission),
    energyEmission: Number(row.energy_emission),
    foodEmission: Number(row.food_emission),
    shoppingEmission: Number(row.shopping_emission),
    vacationEmission: Number(row.vacation_emission),
    totalEmission: Number(row.total_emission),
  }));
}

export async function saveEmission(emission: Omit<Emission, 'id'> & { activityId: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('emissions').insert({
    user_id: user.id,
    activity_id: emission.activityId,
    date: emission.date,
    transport_emission: emission.transportEmission,
    energy_emission: emission.energyEmission,
    food_emission: emission.foodEmission,
    shopping_emission: emission.shoppingEmission,
    vacation_emission: emission.vacationEmission,
    total_emission: emission.totalEmission,
  });
  if (error) console.error('saveEmission error:', error);
}
