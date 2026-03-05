import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, RefreshCw, ArrowRight } from 'lucide-react';

export default function WelcomeBackPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-foreground tracking-tight">Welcome back, {userName}!</h1>
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
