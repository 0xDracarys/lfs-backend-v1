
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
    <div className="bg-card text-card-foreground p-4 rounded-lg mb-4"> {/* Themed container */}
      <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground"> {/* Themed title */}
        <ChevronRight className="mr-1 h-5 w-5 text-accent-primary" /> {/* Themed icon */}
        Build Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-terminal-border/30 p-3 rounded-md"> {/* Themed grid item bg */}
          <div className="text-sm text-muted-foreground">Current Phase</div> {/* Themed label */}
          <div className="font-medium text-foreground">{currentPhase}</div> {/* Themed value */}
        </div>
        
        <div className="bg-terminal-border/30 p-3 rounded-md"> {/* Themed grid item bg */}
          <div className="text-sm text-muted-foreground">User Context</div> {/* Themed label */}
          <div 
            className={`font-medium ${
              currentContext === UserContext.ROOT ? "text-lfs-root" : // Keep specific context colors
              currentContext === UserContext.LFS_USER ? "text-lfs-lfs-user" :
              "text-lfs-chroot"
            }`}
          >
            {currentContext}
          </div>
        </div>
        
        <div className="bg-terminal-border/30 p-3 rounded-md"> {/* Themed grid item bg */}
          <div className="text-sm text-muted-foreground">Progress</div> {/* Themed label */}
          <div className="font-medium text-foreground">{buildProgress}%</div> {/* Themed value */}
        </div>
      </div>
    </div>
  );
};

export default BuildSummary;
