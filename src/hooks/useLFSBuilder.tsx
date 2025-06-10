
import React, { useState, useEffect } from "react";
import { 
  BuildStep as BuildStepType,
  BuildStatus, 
  InputRequest, 
  LFS_BUILD_STEPS, 
  UserContext,
  BuildPhase
} from "../lib/lfs-automation";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from 'react-router-dom';
import { getBuildConfigurationById, LFSBuildConfig } from '@/lib/supabase/configs';
import { startBuild as startNewBuildInDB, updateBuildStatus, recordBuildStep } from '@/lib/supabase/builds'; // Aliased startBuild
import { BuildStep as BuildStepType, BuildStatus, InputRequest, LFS_BUILD_STEPS, UserContext, BuildPhase } from "../lib/lfs-automation";

export const useLFSBuilder = () => {
  const { toast } = useToast();
  const location = useLocation(); // Initialize useLocation

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
  const [loadedConfig, setLoadedConfig] = useState<LFSBuildConfig | null>(null); // To store the loaded config
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null); // To store the ID of the current build record

  // Effect to load configuration if passed in location state
  useEffect(() => {
    const configIdFromState = location.state?.configId as string | undefined;
    if (configIdFromState && !loadedConfig) { // Only load if not already loaded or different
      loadAndApplyConfiguration(configIdFromState);
    }
  }, [location.state, loadedConfig]); // Add loadedConfig to dependency array

  const loadAndApplyConfiguration = async (configId: string) => {
    // Reset existing build state before loading a new config
    await resetBuildInternal(false); // Soft reset without toast/log spam if loading config

    appendToLog(`Loading configuration with ID: ${configId}...`);
    const config = await getBuildConfigurationById(configId);
    if (config) {
      setLoadedConfig(config);
      appendToLog(`Configuration loaded: ${config.name}. Target: ${config.target_disk}, Sources: ${config.sources_path}, Scripts: ${config.scripts_path}`);
      toast({
        title: "Configuration Loaded",
        description: `${config.name}`,
      });
      // Here you could adapt 'steps' based on the config.
      // For example, if config specifies certain script paths or package versions,
      // you might modify the LFS_BUILD_STEPS accordingly.
      // This is a complex part depending on how deeply configs affect build steps.
      // For now, we primarily use configId for starting a build record.
    } else {
      appendToLog(`Failed to load configuration: ${configId}.`);
      toast({
        title: "Error Loading Config",
        description: `Could not load configuration ID: ${configId}.`,
        variant: "destructive",
      });
    }
  };

  // Internal reset function to avoid toast spam when loading config
  const resetBuildInternal = async (showToast = true) => {
    setSteps(LFS_BUILD_STEPS); // Reset to default steps
    setCurrentPhase(BuildPhase.INITIAL_SETUP);
    setCurrentContext(UserContext.ROOT);
    setBuildProgress(0);
    setLogs([
      "LFS Builder initialized",
      "Ready to begin Linux From Scratch (LFS) 11.2 build process",
    ]);
    setScriptOutput([]);
    setInputRequest(null);
    setIsModalOpen(false);
    setBuildRunning(false);
    setCurrentStepId(null);
    // Do not reset loadedConfig here, it's loaded via navigation

    if (activeBuildId) {
      // If there was an active build, mark it as failed or cancelled due to reset
      // For simplicity, we'll just log it. A more robust solution might update its status.
      appendToLog(`Build ${activeBuildId} was reset.`);
      // await updateBuildStatus(activeBuildId, 'failed', currentPhase, currentStepId, buildProgress);
    }
    setActiveBuildId(null); // Reset active build ID

    if (showToast) {
      toast({
        title: "Build Reset",
        description: "All progress has been reset.",
      });
    }
  };

  const resetBuild = async () => {
    await resetBuildInternal(true);
    // Reset loadedConfig as well if the user explicitly clicks reset.
    // This depends on desired UX: should reset clear the loaded config or just the progress?
    // For now, let's assume reset also clears the feeling of "building from this config".
    setLoadedConfig(null); // Explicitly clear loaded config on manual reset
    // This ensures if user navigates away and back without state, it's a fresh start.
  };

  // This function will be called by LFSBuilder.tsx when the play/pause button is clicked
  // It handles the logic of starting a new build record if one isn't active.
  const initiateBuildProcess = async (): Promise<string | null> => {
    if (activeBuildId) {
      appendToLog(`Resuming build ID: ${activeBuildId}.`);
      // Optionally update status to 'in_progress' if there was a 'paused' state
      // await updateBuildStatus(activeBuildId, 'in_progress', currentPhase, currentStepId, buildProgress);
      return activeBuildId;
    }

    const newBuildRecord = await startNewBuildInDB(loadedConfig?.id || null);
    if (newBuildRecord && newBuildRecord.id) {
      setActiveBuildId(newBuildRecord.id);
      appendToLog(`New build started with ID: ${newBuildRecord.id}. Config: ${loadedConfig?.name || 'Default'}`);
      // Initial status update after starting
      await updateBuildStatus(newBuildRecord.id, 'in_progress', currentPhase, null, 0);
      return newBuildRecord.id;
    } else {
      toast({
        title: "Error Starting Build",
        description: "Could not create a new build record in the database.",
        variant: "destructive",
      });
      return null;
    }
  };


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

  // Update build progress & potentially build status in DB
  useEffect(() => {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === BuildStatus.COMPLETED || s.status === BuildStatus.SKIPPED).length;
    const newProgress = Math.round((completedSteps / totalSteps) * 100);
    setBuildProgress(newProgress);

    if (activeBuildId && buildRunning) { // Only update if a build is active and running
      let overallStatus: LFSBuildRecord['status'] = 'in_progress';
      if (newProgress === 100) {
        overallStatus = 'completed';
        setBuildRunning(false); // Stop build automatically on completion
        appendToLog("Build completed!");
        toast({ title: "Build Complete!", description: "All steps finished."});
      }
      // Failure is handled by individual steps calling updateStepStatus with FAILED

      updateBuildStatus(activeBuildId, overallStatus, currentPhase, currentStepId, newProgress);
    }
  }, [steps, activeBuildId, buildRunning, currentPhase, currentStepId]);


  const updateStepStatus = async (stepId: string, status: BuildStatus, stepLog?: string) => {
    setSteps(prevSteps => prevSteps.map(s => (s.id === stepId ? { ...s, status } : s)));

    if (activeBuildId) {
      await recordBuildStep(activeBuildId, stepId, status, stepLog);
      if (status === BuildStatus.FAILED) {
        setBuildRunning(false); // Stop build on failure
        appendToLog(`Step ${stepId} failed. Build halted.`);
        toast({ title: "Step Failed", description: `Step ${stepId} failed. Build halted.`, variant: "destructive"});
        await updateBuildStatus(activeBuildId, 'failed', currentPhase, stepId, buildProgress);
      }
    }
  };

  // Helper to append to log. This log is for UI display. Step-specific logs for DB are passed to updateStepStatus.
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
    const phases = Object.values(BuildPhase);
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
    loadedConfig, // Expose loadedConfig
    activeBuildId, // Expose activeBuildId
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
    toast,
    resetBuild, // Expose resetBuild
    initiateBuildProcess, // Expose function to start/resume build process
    setActiveBuildId // Expose setActiveBuildId, primarily for initiateBuildProcess
  };
};

export default useLFSBuilder;
