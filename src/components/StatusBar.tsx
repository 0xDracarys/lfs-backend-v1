
import React from "react";
import { UserContext } from "../lib/lfs-automation";

interface StatusBarProps {
  currentContext: UserContext;
  currentPhase: string;
  buildProgress: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  currentContext, 
  currentPhase, 
  buildProgress 
}) => {
  // Map context to appropriate color
  const getContextColor = () => {
    switch(currentContext) {
      case UserContext.ROOT:
        return "bg-lfs-root";
      case UserContext.LFS_USER:
        return "bg-lfs-lfs-user";
      case UserContext.CHROOT:
        return "bg-lfs-chroot";
      default:
        return "bg-border"; // Use border color for default background
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-theme-bg-primary text-theme-text-secondary flex items-center px-4">
      <div className={`flex items-center ${getContextColor()} px-3 py-1 rounded-md mr-4 text-theme-text-primary`}>
        <span className="font-bold">Context: </span><span className="ml-1">{currentContext}</span>
      </div>
      <div className="flex-1 mr-4 flex items-center">
        <span className="mr-2">Current Phase:</span><span className="text-theme-text-primary mr-4">{currentPhase}</span>
        <div className="w-full bg-theme-bg-secondary h-2.5 rounded-full flex-1"> {/* Adjusted height for visibility */}
          <div 
            className="bg-primary h-full rounded-full" // Use theme-accent-lime (via bg-primary)
            style={{ width: `${buildProgress}%` }} 
          />
        </div>
      </div>
      <div className="text-sm ml-4"> {/* Added ml-4 for spacing */}
        <span className="mr-1">Progress:</span><span className="text-theme-text-primary">{buildProgress}%</span>
      </div>
    </div>
  );
};

export default StatusBar;
