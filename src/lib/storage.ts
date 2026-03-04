import { Activity, Emission, calculateEmissions } from './carbonEngine';

function getUserEmail(): string {
  const auth = localStorage.getItem('carbonwise_auth');
  if (auth) {
    const parsed = JSON.parse(auth);
    return parsed.email || 'default';
  }
  return 'default';
}

function activitiesKey() { return `carbonwise_activities_${getUserEmail()}`; }
function emissionsKey() { return `carbonwise_emissions_${getUserEmail()}`; }
function profileKey() { return `carbonwise_profile_${getUserEmail()}`; }

export function getActivities(): Activity[] {
  const data = localStorage.getItem(activitiesKey());
  return data ? JSON.parse(data) : [];
}

export function saveActivity(activity: Activity) {
  const activities = getActivities();
  activities.push(activity);
  localStorage.setItem(activitiesKey(), JSON.stringify(activities));
}

export function getEmissions(): Emission[] {
  const data = localStorage.getItem(emissionsKey());
  return data ? JSON.parse(data) : [];
}

export function saveEmission(emission: Emission) {
  const emissions = getEmissions();
  emissions.push(emission);
  localStorage.setItem(emissionsKey(), JSON.stringify(emissions));
}

export function getProfile() {
  const data = localStorage.getItem(profileKey());
  return data ? JSON.parse(data) : { name: 'User', email: '', points: 0, badges: [], joinedDate: new Date().toISOString() };
}

export function saveProfile(profile: any) {
  localStorage.setItem(profileKey(), JSON.stringify(profile));
}

export function generateSampleData() {
  const existing = getActivities();
  if (existing.length > 0) return;

  const diets = ['omnivore', 'vegetarian', 'vegan', 'pescatarian'];
  const transports = ['petrol', 'public', 'bicycle', 'diesel'];
  const shopping: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const activity: Activity = {
      id: crypto.randomUUID(),
      date: date.toISOString().split('T')[0],
      transportType: transports[Math.floor(Math.random() * transports.length)],
      transportDistance: Math.round(200 + Math.random() * 2000),
      energyConsumption: Math.round(50 + Math.random() * 200),
      dietType: diets[Math.floor(Math.random() * diets.length)],
      mealsPerDay: 2 + Math.floor(Math.random() * 2),
      shoppingFrequency: shopping[Math.floor(Math.random() * shopping.length)],
      vacationMode: 'none',
      vacationDistance: 0,
    };
    saveActivity(activity);

    const emissionData = calculateEmissions(activity);
    saveEmission({
      id: crypto.randomUUID(),
      activityId: activity.id,
      ...emissionData,
    });
  }
}
