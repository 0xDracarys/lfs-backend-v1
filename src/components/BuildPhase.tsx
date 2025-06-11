
import React from "react";
import { BuildPhase as BuildPhaseEnum, BuildStep as BuildStepType, BuildStatus } from "../lib/lfs-automation";
import BuildStep from "./BuildStep";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BuildPhaseProps {
  phase: BuildPhaseEnum;
  steps: BuildStepType[];
  onStartStep: (step: BuildStepType) => void;
  isCurrentPhase?: boolean;
  isCompleted?: boolean;
}

const BuildPhaseComponent: React.FC<BuildPhaseProps> = ({ 
  phase, 
  steps, 
  onStartStep,
  isCurrentPhase = false,
  isCompleted = false
}) => {
  const [expanded, setExpanded] = React.useState(isCurrentPhase);
  
  // Count steps by status
  const completedSteps = steps.filter(s => s.status === BuildStatus.COMPLETED).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  return (
    <Card className={`mb-4 ${isCurrentPhase ? 'ring-2 ring-offset-2 ring-htb-accent-green' : ''}`}>
      <CardHeader 
        className="py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-foreground">{phase}</h3>
            {isCurrentPhase && (
              <span className="bg-htb-accent-green text-htb-bg-primary text-xs px-2 py-0.5 rounded-full">Current</span>
            )}
            {isCompleted && (
              <span className="bg-htb-status-success text-htb-bg-primary text-xs px-2 py-0.5 rounded-full">Completed</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground"> {/* Themed progress text */}
              {completedSteps}/{totalSteps} steps ({progress}%)
            </div>
            {expanded ? <ChevronUp size={18} className="text-foreground" /> : <ChevronDown size={18} className="text-foreground" />} {/* Themed icons */}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="py-3 bg-background"> {/* Ensure content bg matches main bg if different from card */}
          <div className="space-y-2">
            {steps.map(step => (
              <BuildStep
                key={step.id}
                step={step}
                onStart={onStartStep}
                disabled={!isCurrentPhase}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BuildPhaseComponent;
