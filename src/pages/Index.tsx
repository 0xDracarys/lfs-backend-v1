
import React from "react";
import LFSBuilder from "@/components/LFSBuilder";
import type { Session } from '@supabase/supabase-js'; // Import Session type

interface IndexProps {
  session?: Session | null; // Make session optional for now
}

const Index: React.FC<IndexProps> = ({ session }) => {
  // The LFSBuilder component expects a session prop.
  // If Index is meant to render LFSBuilder, it must pass the session.
  // If LFSBuilder is the main page "/" and Index is "/configs",
  // then Index should render its own content, not LFSBuilder.
  // Assuming Index is for "/configs" and should have its own content.
  // For now, let's pass session to LFSBuilder if it's rendered here,
  // but this structure for Index page seems problematic if it just re-renders LFSBuilder.
  // This might need to be re-evaluated based on actual content for "/configs".
  // For the purpose of this task (accepting the prop), this is sufficient.

  // If Index is supposed to be the configurations page, it shouldn't render LFSBuilder.
  // It should have its own content.
  // Let's assume for now, it's a placeholder and might display session info or config options.
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold">Configurations Page (Index)</h1>
      {session?.user && <p>Logged in as: {session.user.email}</p>}
      {/* Placeholder for actual configuration content */}
      <p>This is the configurations page. Session is {session ? "active" : "not active"}.</p>
      {/* If LFSBuilder was intended here, it would be <LFSBuilder session={session} /> */}
    </div>
  );
};

export default Index;
