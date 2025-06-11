
import React from "react";
import { BuildStep as BuildStepType, BuildStatus, UserContext } from "../lib/lfs-automation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Circle, PlayCircle, AlertCircle, Clock } from "lucide-react";

interface BuildStepProps {
  step: BuildStepType;
  onStart: (step: BuildStepType) => void;
  disabled?: boolean;
}

const BuildStep: React.FC<BuildStepProps> = ({ step, onStart, disabled = false }) => {
  // Get status icon based on step status
  const getStatusIcon = () => {
    switch(step.status) {
      case BuildStatus.COMPLETED:
        return <CheckCircle className="text-terminal-success" />;
      case BuildStatus.IN_PROGRESS:
        return <PlayCircle className="text-terminal-accent-primary animate-pulse-soft" />;
      case BuildStatus.FAILED:
        return <AlertCircle className="text-terminal-error" />;
      case BuildStatus.SKIPPED:
        return <Clock className="text-terminal-warning" />;
      case BuildStatus.PENDING:
      default:
        return <Circle className="text-muted-foreground" />;
    }
  };

  // Get border color based on context
  const getContextBorder = () => {
    switch(step.context) {
      case UserContext.ROOT:
        return "border-l-4 border-lfs-root";
      case UserContext.LFS_USER:
        return "border-l-4 border-lfs-lfs-user";
      case UserContext.CHROOT:
        return "border-l-4 border-lfs-chroot";
      default:
        return "";
    }
  };

  // Get status text class
  const getStatusClass = () => {
    switch(step.status) {
      case BuildStatus.COMPLETED:
        return "text-terminal-success";
      case BuildStatus.IN_PROGRESS:
        return "text-terminal-accent-primary";
      case BuildStatus.FAILED:
        return "text-terminal-error";
      case BuildStatus.SKIPPED:
        return "text-terminal-warning";
      case BuildStatus.PENDING:
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={`mb-2 ${getContextBorder()}`}>
      <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <span className="mr-2">{getStatusIcon()}</span>
          <h4 className="text-base font-medium text-foreground">{step.name}</h4> {/* Ensure text color */}
        </div>
        {/* TooltipProvider and Tooltip removed, status text remains */}
        <div className={`text-xs ${getStatusClass()} font-medium uppercase`}>
          {step.status}
        </div>
        {/* Consider adding context display back if important, e.g., next to status or below description */}
        {/* <p className="text-xs text-muted-foreground">{step.context} context</p> */} {/* Themed if uncommented */}
      </CardHeader>

      <CardContent className="py-2 text-sm text-muted-foreground"> {/* Themed description text */}
        <p>{step.description}</p>
        {step.requiresInput && (
          <span className="inline-flex items-center mt-1 text-xs bg-terminal-warning text-terminal-bg px-2 py-0.5 rounded">
            Requires Input
          </span>
        )}
        {step.estimatedTime && (
          <span className="inline-flex items-center ml-2 mt-1 text-xs bg-terminal-accent-secondary text-terminal-bg px-2 py-0.5 rounded">
            ~{Math.round(step.estimatedTime / 60)} min
          </span>
        )}
      </CardContent>

      {step.status === BuildStatus.PENDING && (
        <CardFooter className="pt-1 pb-3">
          <Button 
            size="sm" 
            onClick={() => onStart(step)}
            disabled={disabled}
          >
            Start
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BuildStep;
