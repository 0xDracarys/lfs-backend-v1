
import React, { useState, useEffect } from "react";
import { 
  BuildPhase as BuildPhaseEnum, 
  BuildStep as BuildStepType,
  BuildStatus, 
  InputRequest, 
  LFS_BUILD_STEPS, 
  UserContext 
} from "../lib/lfs-automation";
import BuildPhaseComponent from "./BuildPhase";
import LogViewer from "./LogViewer";
import StatusBar from "./StatusBar";
import InputModal from "./InputModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  HardDrive, 
  Settings, 
  Terminal,
  ChevronRight
} from "lucide-react";

const LFSBuilder: React.FC = () => {
  const { toast } = useToast();
  const [steps, setSteps] = useState<BuildStepType[]>(LFS_BUILD_STEPS);
  const [currentPhase, setCurrentPhase] = useState<BuildPhaseEnum>(BuildPhaseEnum.INITIAL_SETUP);
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
    return steps.reduce<Record<BuildPhaseEnum, BuildStepType[]>>((acc, step) => {
      if (!acc[step.phase]) {
        acc[step.phase] = [];
      }
      acc[step.phase].push(step);
      return acc;
    }, {} as Record<BuildPhaseEnum, BuildStepType[]>);
  }, [steps]);

  // Calculate phase completion status
  const phaseStatus = React.useMemo(() => {
    return Object.entries(stepsByPhase).reduce<Record<BuildPhaseEnum, {completed: boolean}>>((acc, [phase, phaseSteps]) => {
      acc[phase as BuildPhaseEnum] = {
        completed: phaseSteps.every(step => step.status === BuildStatus.COMPLETED || step.status === BuildStatus.SKIPPED)
      };
      return acc;
    }, {} as Record<BuildPhaseEnum, {completed: boolean}>);
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

  // Mock function to simulate running a build step
  const runBuildStep = async (step: BuildStepType) => {
    if (step.status !== BuildStatus.PENDING) return;
    
    // Update step status to in progress
    updateStepStatus(step.id, BuildStatus.IN_PROGRESS);
    setCurrentStepId(step.id);
    
    // Handle input requirement
    if (step.requiresInput) {
      const inputType = step.id.includes("password") ? "password" : "text";
      const message = step.id.includes("password")
        ? `Enter password for ${step.id.includes("root") ? "root" : "lfs"} user:`
        : `Input required for ${step.name}:`;
      
      setInputRequest({
        type: inputType as "text" | "password",
        message,
        required: true
      });
      setIsModalOpen(true);
      return; // Wait for input before continuing
    }

    try {
      // Add step command to logs if available
      if (step.command) {
        const commandLines = step.command.split('\n');
        for (const line of commandLines) {
          appendToLog(`$ ${line}`);
        }
      }
      
      // Simulate execution (with delay based on estimated time or default)
      const executionTime = step.estimatedTime ? Math.min(step.estimatedTime, 3) * 1000 : 2000;
      
      // For demonstration, we'll show simulated output for some steps
      if (step.id === 'partition-disk') {
        await simulatePartitionDisk();
      } else if (step.id.includes('script')) {
        await simulateScriptExecution(step);
      } else {
        await new Promise(resolve => setTimeout(resolve, executionTime));
        appendToLog(`Completed: ${step.name}`);
      }
      
      // Mark step as completed
      updateStepStatus(step.id, BuildStatus.COMPLETED);
      
      // Show toast notification
      toast({
        title: "Step Completed",
        description: step.name,
      });
      
      // Auto-run next step if build is running
      if (buildRunning) {
        const nextStep = findNextStep();
        if (nextStep) {
          runBuildStep(nextStep);
        } else {
          setBuildRunning(false);
          toast({
            title: "Build Complete",
            description: "All steps have been completed successfully",
          });
        }
      }
    } catch (error) {
      updateStepStatus(step.id, BuildStatus.FAILED);
      appendToLog(`Error: ${error}`);
      toast({
        title: "Step Failed",
        description: `${step.name} failed: ${error}`,
        variant: "destructive"
      });
      setBuildRunning(false);
    }
  };

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
        runBuildStep(nextStep);
      } else {
        setBuildRunning(false);
      }
    } else {
      setCurrentStepId(null);
    }
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

  // Simulate partition disk operation
  const simulatePartitionDisk = async () => {
    appendToLog("Partitioning disk...");
    appendToLog("Command: fdisk /dev/sdb");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Welcome to fdisk.");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Command (m for help): n");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Partition type: p (primary)");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Partition number (1-4): 1");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("First sector: [default]");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Last sector: [default]");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Command (m for help): w");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("The partition table has been altered.");
    await new Promise(resolve => setTimeout(resolve, 500));
    appendToLog("Formatting partition...");
    appendToLog("Command: mkfs.ext4 /dev/sdb1");
    await new Promise(resolve => setTimeout(resolve, 1000));
    appendToLog("Writing superblocks and filesystem accounting information: done");
  };

  // Simulate script execution with progress updates
  const simulateScriptExecution = async (step: BuildStepType) => {
    appendToScriptOutput(`Starting ${step.name}...`);
    
    const totalSteps = 10; // Mock number of internal steps
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      appendToScriptOutput(`[${i}/${totalSteps}] Executing step ${i} of ${step.name}`);
      
      if (i === 3) {
        appendToScriptOutput("Configuring build environment...");
      } else if (i === 5) {
        appendToScriptOutput("Compiling toolchain components...");
      } else if (i === 8) {
        appendToScriptOutput("Installing packages...");
      }
    }
    
    appendToScriptOutput(`${step.name} completed successfully.`);
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
        runBuildStep(nextStep);
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
    setSteps(LFS_BUILD_STEPS);
    setCurrentPhase(BuildPhase.INITIAL_SETUP);
    setCurrentContext(UserContext.ROOT);
    setBuildProgress(0);
    setLogs([
      "LFS Builder reset",
      "Ready to begin Linux From Scratch (LFS) 11.2 build process",
    ]);
    setScriptOutput([]);
    setBuildRunning(false);
    setCurrentStepId(null);
    toast({
      title: "Build Reset",
      description: "All progress has been reset",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-6 w-6" />
            <h1 className="text-xl font-bold">LFS Builder</h1>
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">v11.2</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant={buildRunning ? "destructive" : "default"}
              size="sm"
              onClick={toggleBuild}
              className="flex items-center"
            >
              {buildRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {buildRunning ? "Pause Build" : "Start Build"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetBuild}
              className="flex items-center"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Reset
            </Button>
            
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
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
              {Object.entries(BuildPhaseEnum).map(([_, phase]) => (
                stepsByPhase[phase] && (
                  <BuildPhaseComponent
                    key={phase}
                    phase={phase}
                    steps={stepsByPhase[phase]}
                    onStartStep={runBuildStep}
                    isCurrentPhase={currentPhase === phase}
                    isCompleted={phaseStatus[phase]?.completed}
                  />
                )
              ))}
            </div>
          </div>
        </div>
        
        {/* Right column - Logs and progress */}
        <div className="w-full lg:w-3/5">
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <Tabs defaultValue="logs">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Terminal className="mr-1 h-5 w-5 text-blue-500" />
                  Output Monitor
                </h2>
                
                <TabsList>
                  <TabsTrigger value="logs">Build Logs</TabsTrigger>
                  <TabsTrigger value="script">Script Output</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="logs">
                <LogViewer logs={logs} maxHeight="400px" />
              </TabsContent>
              
              <TabsContent value="script">
                <LogViewer 
                  logs={scriptOutput}
                  title="Script Output" 
                  maxHeight="400px" 
                />
              </TabsContent>
            </Tabs>
          </div>
          
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
