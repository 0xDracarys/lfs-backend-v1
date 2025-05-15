
import React, { useState, useEffect } from "react";
import { 
  BuildStep as BuildStepType,
  BuildStatus, 
  InputRequest, 
  LFS_BUILD_STEPS, 
  UserContext 
} from "../lib/lfs-automation";
import { BuildPhase } from "../lib/lfs-automation";
import { useToast } from "@/components/ui/use-toast";

export const useLFSBuilder = () => {
  const { toast } = useToast();
  const [steps, setSteps] = useState<BuildStepType[]>(LFS_BUILD_STEPS);
  const [currentPhase, setCurrentPhase] = useState<BuildPhase>(BuildPhase.INITIAL_SETUP);
  const [currentContext, setCurrentContext] = useState<UserContext>(UserContext.ROOT);
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    "LFS Builder initialized",
    "Ready to begin Linux From Scratch (LFS) 11.2 build process",
    "Please select target disk to start the Initial Setup phase"
  ]);
  const [scriptOutput, setScriptOutput] = useState<string[]>([]);
  const [inputRequest, setInputRequest] = useState<InputRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [buildRunning, setBuildRunning] = useState<boolean>(false);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  // Group steps by phase
  const stepsByPhase = React.useMemo(() => {
    return steps.reduce<Record<BuildPhase, BuildStepType[]>>((acc, step) => {
      if (!acc[step.phase]) {
        acc[step.phase] = [];
      }
      acc[step.phase].push(step);
      return acc;
    }, {} as Record<BuildPhase, BuildStepType[]>);
  }, [steps]);

  // Calculate phase completion status
  const phaseStatus = React.useMemo(() => {
    return Object.entries(stepsByPhase).reduce<Record<BuildPhase, {completed: boolean}>>((acc, [phase, phaseSteps]) => {
      acc[phase as BuildPhase] = {
        completed: phaseSteps.every(step => step.status === BuildStatus.COMPLETED || step.status === BuildStatus.SKIPPED)
      };
      return acc;
    }, {} as Record<BuildPhase, {completed: boolean}>);
  }, [stepsByPhase]);

  // Update build progress
  useEffect(() => {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => 
      s.status === BuildStatus.COMPLETED || s.status === BuildStatus.SKIPPED
    ).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    setBuildProgress(progress);
  }, [steps]);

  // Helper to update step status
  const updateStepStatus = (stepId: string, status: BuildStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Helper to append to log
  const appendToLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  // Helper to append to script output
  const appendToScriptOutput = (message: string) => {
    setScriptOutput(prev => [...prev, message]);
  };

  // Find the next step to run
  const findNextStep = (): BuildStepType | undefined => {
    // Find first pending step in current phase
    const phaseSteps = stepsByPhase[currentPhase] || [];
    const nextStepInPhase = phaseSteps.find(s => s.status === BuildStatus.PENDING);
    
    if (nextStepInPhase) {
      return nextStepInPhase;
    }
    
    // If all steps in current phase are done, move to next phase
    const phases = Object.keys(BuildPhase) as BuildPhase[];
    const currentPhaseIndex = phases.indexOf(currentPhase);
    
    if (currentPhaseIndex < phases.length - 1) {
      const nextPhase = phases[currentPhaseIndex + 1];
      setCurrentPhase(nextPhase);
      
      // Update context based on the phase
      if (nextPhase === BuildPhase.LFS_USER_BUILD) {
        setCurrentContext(UserContext.LFS_USER);
      } else if (nextPhase === BuildPhase.CHROOT_BUILD) {
        setCurrentContext(UserContext.CHROOT);
      }
      
      // Find first pending step in next phase
      const nextPhaseSteps = stepsByPhase[nextPhase] || [];
      return nextPhaseSteps.find(s => s.status === BuildStatus.PENDING);
    }
    
    return undefined;
  };

  return {
    steps,
    setSteps,
    currentPhase,
    setCurrentPhase,
    currentContext,
    setCurrentContext,
    buildProgress,
    logs,
    scriptOutput,
    inputRequest,
    setInputRequest,
    isModalOpen,
    setIsModalOpen,
    buildRunning,
    setBuildRunning,
    currentStepId,
    setCurrentStepId,
    stepsByPhase,
    phaseStatus,
    updateStepStatus,
    appendToLog,
    appendToScriptOutput,
    findNextStep,
    toast
  };
};

export default useLFSBuilder;
