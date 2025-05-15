
import React from "react";
import { HardDrive, Play, Pause, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  buildRunning: boolean;
  toggleBuild: () => void;
  resetBuild: () => void;
}

const Header: React.FC<HeaderProps> = ({
  buildRunning,
  toggleBuild,
  resetBuild
}) => {
  return (
    <header className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-6 w-6" />
          <h1 className="text-xl font-bold">LFS Builder</h1>
          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">v11.2</span>
        </div>
        
        <div className="flex items-center space-x-4">
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
            className="flex items-center"
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
