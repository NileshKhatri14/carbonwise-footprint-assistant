// Simple localStorage-based auth
const AUTH_KEY = 'carbonwise_auth';
const USERS_KEY = 'carbonwise_users';

export interface AuthUser {
  name: string;
  email: string;
}

interface StoredUser {
  name: string;
  email: string;
  password: string;
}

function getUsers(): StoredUser[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function register(name: string, email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Email already registered' };
  }
  users.push({ name, email, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_KEY, JSON.stringify({ name, email }));
  return { success: true };
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify({ name: user.name, email: user.email }));
  return { success: true };
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

// Per-user onboarding status
export function isOnboarded(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return localStorage.getItem(`carbonwise_onboarded_${user.email}`) === 'true';
}

export function setOnboarded() {
  const user = getCurrentUser();
  if (user) {
    localStorage.setItem(`carbonwise_onboarded_${user.email}`, 'true');
  }
}
