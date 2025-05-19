
import React from "react";
import { Button } from "@/components/ui/button";
import { Disc, Cpu } from "lucide-react";

interface HeaderSectionProps {
  showDockerMonitor: boolean;
  onToggleDockerMonitor: () => void;
  onRefresh: () => void;
  onConfigureBackend: () => void;
}

const HeaderSection = ({ 
  showDockerMonitor, 
  onToggleDockerMonitor, 
  onRefresh, 
  onConfigureBackend 
}: HeaderSectionProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Disc className="h-6 w-6" /> ISO Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your LFS ISO images and real ISO generation
        </p>
      </div>
      
      <div className="flex gap-2 mt-4 md:mt-0">
        <Button 
          variant="outline" 
          onClick={onToggleDockerMonitor}
          className="flex items-center gap-1"
        >
          <Cpu className="h-4 w-4" />
          {showDockerMonitor ? "Hide Docker Monitor" : "Show Docker Monitor"}
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
        <Button onClick={onConfigureBackend}>
          Configure Backend
        </Button>
      </div>
    </div>
  );
};

export default HeaderSection;
