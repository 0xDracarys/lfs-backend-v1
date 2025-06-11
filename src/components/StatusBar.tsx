
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
        return "bg-muted-foreground"; // Themed default
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-htb-bg-primary text-htb-text-secondary flex items-center px-4"> {/* HTB themed status bar */}
      <div className={`flex items-center ${getContextColor()} px-3 py-1 rounded-md mr-4 text-htb-text-primary`}> {/* HTB text for contrast */}
        <span className="font-bold">Context: {currentContext}</span>
      </div>
      <div className="flex-1 mr-4">
        <span className="mr-4">Current Phase: {currentPhase}</span>
        <div className="w-full bg-htb-bg-secondary h-2 rounded-full"> {/* HTB themed progress bar background */}
          <div 
            className="bg-htb-accent-green h-2 rounded-full" // HTB themed progress bar fill
            style={{ width: `${buildProgress}%` }} 
          />
        </div>
      </div>
      <div className="text-sm">
        Total Progress: {buildProgress}%
      </div>
    </div>
  );
};

export default StatusBar;
