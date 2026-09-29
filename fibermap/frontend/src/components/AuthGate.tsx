import { useState } from 'react';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

type View = 'landing' | 'login' | 'register';

export default function AuthGate() {
  const [view, setView] = useState<View>('landing');

  if (view === 'login') {
    return <LoginPage onRegisterClick={() => setView('register')} onBack={() => setView('landing')} />;
  }

  if (view === 'register') {
    return <RegisterPage onBackToLogin={() => setView('login')} onBack={() => setView('landing')} />;
  }

  return <LandingPage onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />;
}
