
import React from "react";
import {
  HardDrive, Play, Pause, RefreshCw, Settings, LogOut, User, LogIn, UserPlus,
  Home, FileText, Disc, History as HistoryIcon, ChevronDown // Icons for nav
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { cn } from "@/lib/utils"; // Import cn utility

interface HeaderProps {
  session: Session | null;
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
  const location = useLocation(); // For active link highlighting
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", title: "Builder", icon: Home }, // Shortened title for header
    { path: "/configs", title: "Configurations", icon: Settings },
    { path: "/history", title: "History", icon: HistoryIcon },
    { path: "/testing", title: "Testing", icon: FileText },
    { path: "/iso", title: "ISO Management", icon: Disc }
  ];

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
          <span className="text-xs bg-terminal-accent-secondary text-terminal-bg px-2 py-0.5 rounded mr-4">v11.2</span> {/* Added mr-4 for spacing, themed badge */}
        </div>

        {/* Navigation Links - Placed in the middle */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.slice(0, 3).map((item) => ( // Display first 3 items directly
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1",
                currentPath === item.path
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}

          {navItems.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" // Use ghost variant for a less intrusive look
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 text-gray-300 hover:bg-gray-700 hover:text-white focus-visible:ring-0"
                >
                  <span>More</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
                {navItems.slice(3).map((item) => (
                  <DropdownMenuItem key={item.path} asChild className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    <Link
                      to={item.path}
                      className={cn(
                        "w-full px-3 py-2 text-sm font-medium flex items-center space-x-1",
                        currentPath === item.path
                          ? "bg-gray-700 text-white" // Active style for dropdown item
                          : "text-gray-300"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
        
        <div className="flex items-center space-x-4 ml-auto"> {/* Added ml-auto to push controls to the right */}
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
            className="flex items-center text-gray-200"
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          
          <Button variant="outline" size="icon" className="text-gray-200">
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
                className="flex items-center text-gray-200"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center text-gray-200">
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
