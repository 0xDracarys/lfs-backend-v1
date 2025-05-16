
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
    <Card className={`mb-4 ${isCurrentPhase ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
      <CardHeader 
        className={`py-3 cursor-pointer ${isCompleted ? 'bg-green-50' : isCurrentPhase ? 'bg-blue-50' : 'bg-gray-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{phase}</h3>
            {isCurrentPhase && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Current</span>
            )}
            {isCompleted && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Completed</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              {completedSteps}/{totalSteps} steps ({progress}%)
            </div>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="py-3">
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
