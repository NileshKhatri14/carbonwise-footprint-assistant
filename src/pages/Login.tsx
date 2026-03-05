import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) { toast.error('Name is required'); setLoading(false); return; }
        const result = await register(name.trim(), email.trim(), password);
        if (result.success) {
          toast.success("Account created! Let's log your first activity.");
          navigate('/onboarding');
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await login(email.trim(), password);
        if (result.success) {
          toast.success('Welcome back!');
          navigate('/welcome-back');
        } else {
          toast.error(result.error);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-foreground tracking-tight">CarbonWise</h1>
          <p className="text-primary-foreground/60 text-sm mt-1">Track. Reduce. Sustain.</p>
        </div>

        <Card className="p-8 shadow-elevated">
          <h2 className="text-xl font-display font-semibold mb-6 text-center">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> Full Name
                </Label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={isRegister}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold py-3" disabled={loading}>
              {isRegister ? (
                <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => { setIsRegister(!isRegister); setName(''); }}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-primary-foreground/40">
          AI-powered carbon footprint reduction assistant
        </p>
      </div>
    </div>
  );
}
