import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isOnboarded } from '@/lib/auth';

const Index = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isOnboarded()) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return null;
};

export default Index;
