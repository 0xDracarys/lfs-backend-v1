
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
        return "bg-gray-500";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-gray-800 text-white flex items-center px-4">
      <div className={`flex items-center ${getContextColor()} px-3 py-1 rounded-md mr-4`}>
        <span className="font-bold">Context: {currentContext}</span>
      </div>
      <div className="flex-1 mr-4">
        <span className="mr-4">Current Phase: {currentPhase}</span>
        <div className="w-full bg-gray-600 h-2 rounded-full">
          <div 
            className="bg-lfs-progress h-2 rounded-full"
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
