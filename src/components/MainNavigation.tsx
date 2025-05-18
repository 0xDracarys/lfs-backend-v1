
import React from "react";
import { Link } from "react-router-dom";
import { Home, Settings, FileText, Disc } from "lucide-react";
import { cn } from "@/lib/utils";

const MainNavigation: React.FC = () => {
  // Get the current path to highlight active link
  const currentPath = window.location.pathname;
  
  const navItems = [
    { path: "/", title: "LFS Builder", icon: Home },
    { path: "/testing", title: "Testing", icon: FileText },
    { path: "/iso", title: "ISO Management", icon: Disc },
    { path: "/configs", title: "Configurations", icon: Settings }
  ];
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Disc className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg">LFS System Builder</span>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1",
                    currentPath === item.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="md:hidden flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "p-2 rounded-md flex flex-col items-center",
                  currentPath === item.path
                    ? "text-blue-600"
                    : "text-gray-600"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
