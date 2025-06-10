// src/components/auth/AuthPage.tsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Button } from '@/components/ui/button'; // Using Button for toggle

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <Button variant="link" onClick={switchToRegister} className="p-0 h-auto font-semibold">
                Register here
              </Button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Button variant="link" onClick={switchToLogin} className="p-0 h-auto font-semibold">
                Login here
              </Button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
