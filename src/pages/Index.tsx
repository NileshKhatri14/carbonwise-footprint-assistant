import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        const { data } = await supabase.from('profiles').select('onboarded').eq('user_id', user.id).single();
        if (data?.onboarded) {
          navigate('/welcome-back');
        } else {
          navigate('/onboarding');
        }
      }
      setLoading(false);
    };
    check();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return null;
};

export default Index;
