
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // Added useNavigate
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { supabase } from '@/integrations/supabase/client'; // Added Supabase client
import type { Session } from '@supabase/supabase-js'; // Added Session type
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LFSBuilder from "./components/LFSBuilder";
import Testing from "./pages/Testing";
import IsoManagementPage from "./pages/IsoManagement";
import LoginPage from "./pages/LoginPage"; // Added import
import RegisterPage from "./pages/RegisterPage"; // Added import
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Import ProtectedRoute
import BuildHistoryPage from "./pages/BuildHistoryPage"; // Import BuildHistoryPage

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate(); // For programmatic navigation

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // Navigate based on auth state
        if (_event === 'SIGNED_IN' && session) {
          // Redirect to home or dashboard after sign in
          // For now, let's assume LFSBuilder is the main app page after login
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            navigate('/');
          }
        } else if (_event === 'SIGNED_OUT') {
          // Redirect to login page after sign out
          navigate('/login');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  // Conditionally render routes based on session
  // This is a basic example; you might want more sophisticated routing logic
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider> {/* TooltipProvider reinstated */}
      <Toaster />
      <Sonner />
      {/* BrowserRouter is moved to main.tsx or index.tsx in Vite projects usually */}
        {/* Assuming BrowserRouter is correctly placed here for this project structure */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute session={session} />}>
            <Route path="/" element={<LFSBuilder session={session} />} />
            {/*
              Assuming Index, Testing, and IsoManagementPage might need session
              If they don't, the session prop can be removed from them.
              For now, passing it for consistency and potential future use.
            */}
            <Route path="/configs" element={<Index session={session} />} />
            <Route path="/testing" element={<Testing session={session} />} />
            <Route path="/iso" element={<IsoManagementPage session={session} />} />
            <Route path="/history" element={<BuildHistoryPage session={session} />} /> {/* Added session prop */}
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider> {/* TooltipProvider reinstated */}
    </QueryClientProvider>
  );
};

// Wrap App with BrowserRouter if it's not already in main.tsx or index.tsx
// For this example, assuming App is the top-level component within BrowserRouter
// If not, BrowserRouter should wrap App in the rendering entry point of your application.

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
