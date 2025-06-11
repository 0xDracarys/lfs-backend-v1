
import React, { useState } from "react"; // Added useState
import {
  HardDrive, Play, Pause, RefreshCw, Settings, LogOut, User, LogIn, UserPlus,
  Home, FileText, Disc, History as HistoryIcon, ChevronDown // Icons for nav
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  // DialogClose, // Not used in this specific implementation, but good to have if needed
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Added Tooltip imports
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // Added state for modal

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
    <header className="bg-background text-foreground py-4"> {/* Use CSS variables */}
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-6 w-6 text-htb-accent-green" /> {/* Icon color */}
          <h1 className="text-xl font-bold">LFS Builder</h1>
          <span className="text-xs bg-htb-accent-green text-htb-bg-primary px-2 py-0.5 rounded mr-4">v11.2</span> {/* HTB themed badge */}
        </div>

        {/* Navigation Links - Placed in the middle */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.slice(0, 3).map((item) => ( // Display first 3 items directly
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 underline underline-offset-4", // Added underline
                currentPath === item.path
                  ? "bg-card text-primary font-semibold" // Active link style
                  : "text-primary hover:text-primary/80 hover:bg-card" // Inactive link style
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
                  variant="ghost"
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 text-primary hover:text-primary/80 hover:bg-card focus-visible:ring-0" // Updated trigger style
                >
                  <span>More</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {navItems.slice(3).map((item) => (
                  <DropdownMenuItem key={item.path} asChild className="focus:bg-accent/20 cursor-pointer"> {/* Use accent for focus bg */}
                    <Link
                      to={item.path}
                      className={cn(
                        "w-full flex items-center space-x-1 underline underline-offset-4", // Added underline
                         currentPath === item.path
                          ? "text-primary font-semibold" // Active dropdown link
                          : "text-primary hover:text-primary/80" // Inactive dropdown link
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
        
        <div className="flex items-center space-x-4 ml-auto">
          {/* Build Controls - Buttons are already themed via button.tsx and global CSS vars */}
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
            className="flex items-center" // Text color will come from themed outline button
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          {/* Auth Section */}
          {session?.user ? (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-htb-accent-cyan" /> {/* Icon color */}
                <span className="text-sm text-htb-text-secondary">{session.user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center" // Text color from themed outline
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm" className="flex items-center">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
    <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Settings panel. Functionality to be implemented here.
          </DialogDescription>
        </DialogHeader>
        {/* Placeholder content can go here */}
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Further settings options will be available in a future update.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSettingsModalOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
};

export default Header;
