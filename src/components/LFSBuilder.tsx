
import React from "react";
import { ChevronRight } from "lucide-react";
import { BuildStep as BuildStepType, BuildStatus, BuildPhase, UserContext } from "../lib/lfs-automation";
import BuildPhaseComponent from "./BuildPhase";
import StatusBar from "./StatusBar";
import InputModal from "./InputModal";
import useLFSBuilder from "../hooks/useLFSBuilder";
import { runBuildStep } from "../utils/buildSimulation";
import Header from "./Header";
import BuildSummary from "./BuildSummary";
import OutputMonitor from "./OutputMonitor";

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
    const { LFS_BUILD_STEPS } = require("../lib/lfs-automation");
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <Header 
        buildRunning={buildRunning}
        toggleBuild={toggleBuild}
        resetBuild={resetBuild}
      />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
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
      
      {/* Input modal */}
      <InputModal
        request={inputRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInputSubmit}
      />
    </div>
  );
};

export default LFSBuilder;
