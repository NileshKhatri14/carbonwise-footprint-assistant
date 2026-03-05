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
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function register(name: string, email: string, password: string): { success: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedPassword = password.trim();
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'Email already registered' };
  }
  users.push({ name, email: normalizedEmail, password: trimmedPassword });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_KEY, JSON.stringify({ name, email: normalizedEmail }));
  return { success: true };
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedPassword = password.trim();
  const users = getUsers();
  console.log('Login attempt for:', normalizedEmail, 'Users in DB:', users.length, 'Emails:', users.map(u => u.email));
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === trimmedPassword);
  if (!user) {
    console.log('Login failed. Password lengths:', users.map(u => ({ email: u.email, pwLen: u.password.length })));
    return { success: false, error: 'Invalid email or password' };
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify({ name: user.name, email: user.email }));
  return { success: true };
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.name && parsed.email) return parsed;
    return null;
  } catch {
    return null;
  }
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
