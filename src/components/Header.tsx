
import React from "react";
import { HardDrive, Play, Pause, RefreshCw, Settings, LogOut, User, LogIn, UserPlus } from "lucide-react"; // Added icons
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import type { Session } from '@supabase/supabase-js'; // Import Session type
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

interface HeaderProps {
  session: Session | null; // Add session to props
  buildRunning: boolean;
  toggleBuild: () => void;
  resetBuild: () => void;
}

const Header: React.FC<HeaderProps> = ({
  session, // Destructure session
  buildRunning,
  toggleBuild,
  resetBuild
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
      // Optionally, show a toast notification for the error
    } else {
      // Navigation to /login is handled by onAuthStateChange in App.tsx
    }
  };

  return (
    <header className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-6 w-6" />
          <h1 className="text-xl font-bold">LFS Builder</h1>
          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">v11.2</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Build Controls - keep these as they are */}
          <Button
            variant={buildRunning ? "destructive" : "default"}
            size="sm"
            onClick={toggleBuild}
            className="flex items-center"
          >
            {buildRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
            {buildRunning ? "Pause Build" : "Start Build"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetBuild}
            className="flex items-center text-white"
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          
          <Button variant="outline" size="icon" className="text-white">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Auth Section */}
          {session?.user ? (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm">{session.user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center text-white"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center text-white">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm" className="flex items-center"> {/* Keep default for register or choose another */}
                  <UserPlus className="mr-1 h-4 w-4" />
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
