
import React from "react";
import type { Session } from '@supabase/supabase-js'; // Import Session type
import Configurations from './Configurations'; // Import Configurations component

interface IndexProps {
  session?: Session | null; // Keep session prop as App.tsx passes it
}

const Index: React.FC<IndexProps> = ({ session }) => {
  // The Index page for route /configs should render the Configurations component.
  // The session prop is passed from App.tsx, so IndexProps keeps it.
  // Configurations.tsx itself doesn't currently require 'session' as a prop
  // because its Supabase calls use the global client which is auth-aware.
  return (
    <Configurations />
  );
};

export default Index;
