
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
        return <CheckCircle className="text-lfs-success" />;
      case BuildStatus.IN_PROGRESS:
        return <PlayCircle className="text-lfs-info animate-pulse-soft" />;
      case BuildStatus.FAILED:
        return <AlertCircle className="text-lfs-error" />;
      case BuildStatus.SKIPPED:
        return <Clock className="text-lfs-warning" />;
      case BuildStatus.PENDING:
      default:
        return <Circle className="text-gray-400" />;
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
        return "text-lfs-success";
      case BuildStatus.IN_PROGRESS:
        return "text-lfs-info";
      case BuildStatus.FAILED:
        return "text-lfs-error";
      case BuildStatus.SKIPPED:
        return "text-lfs-warning";
      case BuildStatus.PENDING:
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className={`mb-2 ${getContextBorder()}`}>
      <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <span className="mr-2">{getStatusIcon()}</span>
          <h4 className="text-base font-medium">{step.name}</h4>
        </div>
        {/* TooltipProvider and Tooltip removed, status text remains */}
        <div className={`text-xs ${getStatusClass()} font-medium uppercase`}>
          {step.status}
        </div>
        {/* Consider adding context display back if important, e.g., next to status or below description */}
        {/* <p className="text-xs text-gray-500">{step.context} context</p> */}
      </CardHeader>

      <CardContent className="py-2 text-sm text-gray-600">
        <p>{step.description}</p>
        {step.requiresInput && (
          <span className="inline-flex items-center mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            Requires Input
          </span>
        )}
        {step.estimatedTime && (
          <span className="inline-flex items-center ml-2 mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
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
