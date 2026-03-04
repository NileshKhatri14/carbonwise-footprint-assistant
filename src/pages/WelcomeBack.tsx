import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, RefreshCw, ArrowRight } from 'lucide-react';

export default function WelcomeBackPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-foreground tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-primary-foreground/60 text-sm mt-2">Would you like to update your lifestyle data or go straight to your dashboard?</p>
        </div>

        <Card className="p-8 shadow-elevated space-y-4">
          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-base gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Update Your Details
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full py-6 text-base gap-2"
          >
            Skip for Now <ArrowRight className="w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
