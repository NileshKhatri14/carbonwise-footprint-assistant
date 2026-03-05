import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Activity, BarChart3, TrendingDown, Menu, X, LogOut } from 'lucide-react';
import { getActivities, getEmissions } from '@/lib/storage';
import { predictEmissions, generateRecommendations, getEarnedBadges } from '@/lib/carbonEngine';
import type { Activity as ActivityType, Emission } from '@/lib/carbonEngine';
import { logout } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import EmissionCharts from '@/components/EmissionCharts';
import Recommendations from '@/components/Recommendations';
import Gamification from '@/components/Gamification';
import CarbonOffsets from '@/components/CarbonOffsets';
import AIInsights from '@/components/AIInsights';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [userName, setUserName] = useState('User');
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

  const reload = useCallback(async () => {
    const [acts, ems] = await Promise.all([getActivities(), getEmissions()]);
    setActivities(acts);
    setEmissions(ems);
  }, []);

  useEffect(() => { if (!loading) reload(); }, [reload, loading]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const prediction = predictEmissions(emissions);
  const recommendations = generateRecommendations(emissions);
  const earnedBadges = getEarnedBadges(activities, emissions);
  const latestTotal = emissions.length > 0 ? emissions[emissions.length - 1].totalEmission : 0;

  const stats = [
    { label: 'Total Footprint', value: `${latestTotal}`, unit: 'kg CO₂', icon: Leaf, gradient: 'gradient-card-green' },
    { label: 'Activities Logged', value: `${activities.length}`, unit: 'entries', icon: Activity, gradient: 'gradient-card-blue' },
    { label: 'Predicted Monthly', value: `${prediction.predictedMonthly}`, unit: 'kg CO₂', icon: BarChart3, gradient: 'gradient-card-amber' },
    { label: 'Potential Savings', value: `${recommendations.reduce((s, r) => s + r.potentialReduction, 0)}`, unit: 'kg CO₂', icon: TrendingDown, gradient: 'gradient-card-purple' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-primary-foreground tracking-tight">CarbonWise</h1>
              <p className="text-xs text-primary-foreground/60">Welcome, {userName}</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-primary-foreground/80">
            <a href="#dashboard" className="hover:text-primary-foreground transition-colors">Dashboard</a>
            <a href="#insights" className="hover:text-primary-foreground transition-colors">AI Insights</a>
            <a href="#recommendations" className="hover:text-primary-foreground transition-colors">Tips</a>
            <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X /> : <Menu />}
          </Button>
        </div>
        {mobileNav && (
          <nav className="md:hidden px-4 pb-4 flex flex-col gap-2 text-sm text-primary-foreground/80">
            <a href="#dashboard" onClick={() => setMobileNav(false)}>Dashboard</a>
            <a href="#insights" onClick={() => setMobileNav(false)}>AI Insights</a>
            <a href="#recommendations" onClick={() => setMobileNav(false)}>Tips</a>
            <button onClick={handleLogout} className="text-left text-primary-foreground/70">Logout</button>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        <section id="dashboard" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className={`${stat.gradient} p-5 text-primary-foreground border-0 shadow-elevated animate-fade-in`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-6 h-6 opacity-80" />
                <span className="text-xs opacity-70">{stat.unit}</span>
              </div>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
              <p className="text-sm opacity-80 mt-1">{stat.label}</p>
            </Card>
          ))}
        </section>

        <EmissionCharts emissions={emissions} predictions={prediction.predictions} />

        <section id="insights">
          <AIInsights emissions={emissions} />
        </section>

        <section id="recommendations">
          <Recommendations recommendations={recommendations} />
        </section>

        <Gamification earnedBadges={earnedBadges} emissions={emissions} />
        <CarbonOffsets totalEmission={latestTotal} />
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold text-foreground mb-1">CarbonWise</p>
          <p>AI-powered carbon footprint reduction assistant. Built with React, Linear Regression & ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
