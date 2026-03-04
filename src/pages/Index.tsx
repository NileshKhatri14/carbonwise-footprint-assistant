import { useState, useEffect, useCallback } from 'react';
import { Leaf, Activity, BarChart3, TrendingDown, Menu, X } from 'lucide-react';
import { getActivities, getEmissions, generateSampleData } from '@/lib/storage';
import { predictEmissions, generateRecommendations, getEarnedBadges } from '@/lib/carbonEngine';
import type { Activity as ActivityType, Emission } from '@/lib/carbonEngine';
import ActivityForm from '@/components/ActivityForm';
import EmissionCharts from '@/components/EmissionCharts';
import Recommendations from '@/components/Recommendations';
import Gamification from '@/components/Gamification';
import CarbonOffsets from '@/components/CarbonOffsets';
import AIInsights from '@/components/AIInsights';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [mobileNav, setMobileNav] = useState(false);

  const reload = useCallback(() => {
    setActivities(getActivities());
    setEmissions(getEmissions());
  }, []);

  useEffect(() => {
    generateSampleData();
    reload();
  }, [reload]);

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
      {/* Header */}
      <header className="gradient-hero sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-primary-foreground tracking-tight">CarbonWise</h1>
              <p className="text-xs text-primary-foreground/60">Carbon Footprint Reduction Assistant</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-primary-foreground/80">
            <a href="#dashboard" className="hover:text-primary-foreground transition-colors">Dashboard</a>
            <a href="#log" className="hover:text-primary-foreground transition-colors">Log Activity</a>
            <a href="#insights" className="hover:text-primary-foreground transition-colors">AI Insights</a>
            <a href="#recommendations" className="hover:text-primary-foreground transition-colors">Tips</a>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X /> : <Menu />}
          </Button>
        </div>
        {mobileNav && (
          <nav className="md:hidden px-4 pb-4 flex flex-col gap-2 text-sm text-primary-foreground/80">
            <a href="#dashboard" onClick={() => setMobileNav(false)}>Dashboard</a>
            <a href="#log" onClick={() => setMobileNav(false)}>Log Activity</a>
            <a href="#insights" onClick={() => setMobileNav(false)}>AI Insights</a>
            <a href="#recommendations" onClick={() => setMobileNav(false)}>Tips</a>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats */}
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

        {/* Charts */}
        <EmissionCharts emissions={emissions} predictions={prediction.predictions} />

        {/* Activity Log */}
        <section id="log">
          <ActivityForm onActivityLogged={reload} />
        </section>

        {/* AI Insights */}
        <section id="insights">
          <AIInsights emissions={emissions} />
        </section>

        {/* Recommendations */}
        <section id="recommendations">
          <Recommendations recommendations={recommendations} />
        </section>

        {/* Gamification */}
        <Gamification earnedBadges={earnedBadges} emissions={emissions} />

        {/* Carbon Offsets */}
        <CarbonOffsets totalEmission={latestTotal} />
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold text-foreground mb-1">CarbonWise</p>
          <p>AI-powered carbon footprint reduction assistant. Built with React, Linear Regression & ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
