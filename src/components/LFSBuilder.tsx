
import React from "react";
import { ChevronRight, Info } from "lucide-react";
import { BuildStep as BuildStepType, BuildStatus, BuildPhase, UserContext } from "../lib/lfs-automation";
import { LFS_BUILD_STEPS } from "../lib/lfs-automation";
import BuildPhaseComponent from "./BuildPhase";
import StatusBar from "./StatusBar";
import InputModal from "./InputModal";
import useLFSBuilder from "../hooks/useLFSBuilder";
import { runBuildStep } from "../utils/buildSimulation";
import Header from "./Header";
import BuildSummary from "./BuildSummary";
import OutputMonitor from "./OutputMonitor";
import MainNavigation from "./MainNavigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LFSBuilder: React.FC = () => {
  const {
    steps,
    currentPhase,
    currentContext,
    buildProgress,
    logs,
    scriptOutput,
    inputRequest,
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
    setInputRequest,
    setSteps,
    setCurrentPhase,
    setCurrentContext,
    toast
  } = useLFSBuilder();

  // Handle input submission from modal
  const handleInputSubmit = (value: string) => {
    setIsModalOpen(false);
    setInputRequest(null);
    
    if (!currentStepId) return;
    
    const step = steps.find(s => s.id === currentStepId);
    if (!step) return;
    
    // Log the input (mask if it's a password)
    if (step.id.includes("password")) {
      appendToLog(`Password entered: ********`);
    } else {
      appendToLog(`Input provided: ${value}`);
    }
    
    // Complete the step
    updateStepStatus(step.id, BuildStatus.COMPLETED);
    
    // If build is running, continue with next step
    if (buildRunning) {
      const nextStep = findNextStep();
      if (nextStep) {
        // Add a small delay before starting the next step
        setTimeout(() => {
          runBuildStep(nextStep, {
            updateStepStatus,
            setCurrentStepId,
            appendToLog,
            appendToScriptOutput,
            setInputRequest,
            setIsModalOpen,
            buildRunning,
            findNextStep,
            setBuildRunning,
            toast
          });
        }, 800);
      } else {
        setBuildRunning(false);
      }
    } else {
      setCurrentStepId(null);
    }
  };

  // Start/Stop the build process
  const toggleBuild = () => {
    if (buildRunning) {
      setBuildRunning(false);
      toast({
        title: "Build Paused",
        description: "You can resume the build at any time",
      });
    } else {
      setBuildRunning(true);
      const nextStep = findNextStep();
      if (nextStep) {
        runBuildStep(nextStep, {
          updateStepStatus,
          setCurrentStepId,
          appendToLog,
          appendToScriptOutput,
          setInputRequest,
          setIsModalOpen,
          buildRunning: true,
          findNextStep,
          setBuildRunning,
          toast
        });
      } else {
        setBuildRunning(false);
        toast({
          title: "Build Complete",
          description: "All steps have been completed",
        });
      }
    }
  };

  // Reset the build
  const resetBuild = () => {
    // Directly import from the module instead of using require()
    setSteps(LFS_BUILD_STEPS);
    setCurrentPhase(BuildPhase.INITIAL_SETUP);
    setCurrentContext(UserContext.ROOT);
    appendToLog("LFS Builder reset");
    appendToLog("Ready to begin Linux From Scratch (LFS) 11.2 build process");
    toast({
      title: "Build Reset",
      description: "All progress has been reset",
    });
  };

  // Function to handle starting a build step
  const handleStartStep = (step: BuildStepType) => {
    runBuildStep(step, {
      updateStepStatus,
      setCurrentStepId,
      appendToLog,
      appendToScriptOutput,
      setInputRequest,
      setIsModalOpen,
      buildRunning,
      findNextStep,
      setBuildRunning,
      toast
    });
  };

  // Generate input placeholder based on step ID
  const getInputPlaceholder = (stepId: string): string => {
    if (stepId.includes("disk")) return "e.g., /dev/sda or /dev/sdb";
    if (stepId.includes("partition")) return "e.g., /dev/sda1";
    if (stepId.includes("path")) return "e.g., /mnt/lfs";
    if (stepId.includes("url")) return "e.g., http://mirrors.kernel.org/lfs/...";
    if (stepId.includes("password")) return "Enter a secure password";
    if (stepId.includes("name")) return "e.g., lfs-user";
    return "Enter your input here";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation */}
      <MainNavigation />
      
      {/* Header */}
      <Header 
        buildRunning={buildRunning}
        toggleBuild={toggleBuild}
        resetBuild={resetBuild}
      />
      
      {/* Getting Started Guide */}
      <div className="container mx-auto px-4 py-2 mt-2">
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Getting Started with LFS Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Start with the <strong>Initial Setup</strong> phase - click on each step to begin</li>
              <li>When prompted, enter the required information (disk paths, partition info, etc.)</li>
              <li>Once Initial Setup is complete, use the <strong>Start Build</strong> button to continue automatically</li>
              <li>The build will progress through each phase: Initial Setup → LFS User Build → Chroot Setup</li>
              <li>You can pause the build at any time using the <strong>Pause Build</strong> button</li>
            </ol>
            <p className="mt-2 text-sm font-medium">
              Required inputs: target disk (e.g. /dev/sdb), partition info, mount points, source paths
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6">
        {/* Left column - Build steps */}
        <div className="w-full lg:w-2/5 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ChevronRight className="mr-1 h-5 w-5 text-blue-500" />
              Build Phases
            </h2>
            
            <div className="space-y-4">
              {Object.entries(stepsByPhase).map(([phase, phaseSteps]) => (
                <BuildPhaseComponent
                  key={phase}
                  phase={phase as BuildPhase}
                  steps={phaseSteps}
                  onStartStep={handleStartStep}
                  isCurrentPhase={currentPhase === phase}
                  isCompleted={phaseStatus[phase as BuildPhase]?.completed}
                />
              ))}
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Input Examples & Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <span className="font-medium">Disk Path:</span> /dev/sdb (use a dedicated disk)
              </div>
              <div>
                <span className="font-medium">LFS Partition:</span> /dev/sdb1 (at least 20GB recommended)
              </div>
              <div>
                <span className="font-medium">Mount Point:</span> /mnt/lfs
              </div>
              <div>
                <span className="font-medium">Sources Path:</span> /mnt/lfs/sources
              </div>
              <div>
                <span className="font-medium">Required Space:</span> At least 20GB disk space
              </div>
              <div>
                <span className="font-medium">Packages URL:</span> Default mirrors will be used if empty
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Logs and progress */}
        <div className="w-full lg:w-3/5">
          <OutputMonitor logs={logs} scriptOutput={scriptOutput} />
          <BuildSummary 
            currentPhase={currentPhase}
            currentContext={currentContext}
            buildProgress={buildProgress}
          />
        </div>
      </div>
      
      {/* Status bar */}
      <StatusBar
        currentContext={currentContext}
        currentPhase={currentPhase}
        buildProgress={buildProgress}
      />
      
      {/* Input modal with placeholders */}
      <InputModal
        request={inputRequest ? {
          ...inputRequest,
          placeholder: getInputPlaceholder(currentStepId || '')
        } : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInputSubmit}
      />
    </div>
  );
};

export default LFSBuilder;
