
import React from "react";
import { ChevronRight } from "lucide-react";
import { UserContext } from "../lib/lfs-automation";

interface BuildSummaryProps {
  currentPhase: string;
  currentContext: UserContext;
  buildProgress: number;
}

const BuildSummary: React.FC<BuildSummaryProps> = ({
  currentPhase,
  currentContext,
  buildProgress
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <ChevronRight className="mr-1 h-5 w-5 text-blue-500" />
        Build Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Current Phase</div>
          <div className="font-medium">{currentPhase}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">User Context</div>
          <div 
            className={`font-medium ${
              currentContext === UserContext.ROOT ? "text-lfs-root" :
              currentContext === UserContext.LFS_USER ? "text-lfs-lfs-user" :
              "text-lfs-chroot"
            }`}
          >
            {currentContext}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="font-medium">{buildProgress}%</div>
        </div>
      </div>
    </div>
  );
};

export default BuildSummary;
