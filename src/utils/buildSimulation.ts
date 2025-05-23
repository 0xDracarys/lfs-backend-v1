
import { BuildStep as BuildStepType, BuildStatus } from "../lib/lfs-automation";

// Simulate partition disk operation
export const simulatePartitionDisk = async (appendToLog: (message: string) => void) => {
  appendToLog("Partitioning disk...");
  appendToLog("Command: fdisk /dev/sdb");
  await new Promise(resolve => setTimeout(resolve, 500));
  appendToLog("Welcome to fdisk.");
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate user input sequence to fdisk
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
  
  // This is the critical part - writing changes to disk
  appendToLog("Command (m for help): w");
  await new Promise(resolve => setTimeout(resolve, 1000));
  appendToLog("The partition table has been altered.");
  appendToLog("Syncing disks.");
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Format the partition
  appendToLog("Formatting partition...");
  appendToLog("Command: mkfs.ext4 /dev/sdb1");
  await new Promise(resolve => setTimeout(resolve, 1000));
  appendToLog("Writing superblocks and filesystem accounting information: done");
  appendToLog("Partition process completed successfully");
};

// Simulate Docker container operation for LFS building
export const simulateDockerBuild = async (
  appendToLog: (message: string) => void,
  buildStep: BuildStepType
) => {
  const containerName = `lfs-build-${Date.now()}`;
  
  appendToLog(`Starting Docker container ${containerName} for LFS build...`);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  appendToLog("Mounting volumes for source and output...");
  appendToLog("$ docker run --name " + containerName + " -v ./lfs-sources:/iso-build/input -v ./output:/iso-build/output lfs-iso-builder");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  appendToLog("Container started successfully");
  appendToLog("Executing build step: " + buildStep.name);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Show different output based on step type
  if (buildStep.id.includes('partition')) {
    appendToLog("Setting up disk partitions in container...");
    await simulatePartitionDisk(appendToLog);
  } else if (buildStep.id.includes('build')) {
    appendToLog("Building LFS packages...");
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      appendToLog(`Building package ${i} of 5...`);
    }
    appendToLog("Package build completed successfully");
  } else if (buildStep.id.includes('iso')) {
    appendToLog("Generating ISO image in Docker container...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    appendToLog("Creating ISO structure...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    appendToLog("Adding bootloader...");
    await new Promise(resolve => setTimeout(resolve, 800));
    appendToLog("Finalizing ISO image...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    appendToLog("ISO generated successfully: lfs-custom.iso");
    appendToLog("ISO is available in the output directory");
  } else {
    // Generic simulation for other steps
    await new Promise(resolve => setTimeout(resolve, 1500));
    appendToLog("Command executed successfully in Docker container");
  }
  
  appendToLog(`Stopping Docker container ${containerName}...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  appendToLog(`Container ${containerName} stopped and removed`);
};

// Simulate script execution with progress updates
export const simulateScriptExecution = async (
  step: BuildStepType, 
  appendToScriptOutput: (message: string) => void
) => {
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

// Mock function to simulate running a build step
export const runBuildStep = async (
  step: BuildStepType,
  {
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
  }: {
    updateStepStatus: (stepId: string, status: BuildStatus) => void;
    setCurrentStepId: (id: string | null) => void;
    appendToLog: (message: string) => void;
    appendToScriptOutput: (message: string) => void;
    setInputRequest: (req: any) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    buildRunning: boolean;
    findNextStep: () => BuildStepType | undefined;
    setBuildRunning: (running: boolean) => void;
    toast: any;
  }
) => {
  if (step.status !== BuildStatus.PENDING) return;
  
  // Update step status to in progress
  updateStepStatus(step.id, BuildStatus.IN_PROGRESS);
  setCurrentStepId(step.id);
  
  // Handle input requirement - THIS IS THE CRUCIAL PART FOR ALL BLOCKS TO ACCEPT INPUT
  if (step.requiresInput) {
    const inputType = step.id.includes("password") ? "password" : "text";
    const message = step.id.includes("password")
      ? `Enter password for ${step.id.includes("root") ? "root" : "lfs"} user:`
      : step.id.includes("disk")
      ? "Enter target disk device (e.g., /dev/sdb):"
      : step.id.includes("sources")
      ? "Enter path to LFS sources:"
      : `Input required for ${step.name}:`;
    
    appendToLog(`Requesting input: ${message}`);
    
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
      await simulatePartitionDisk(appendToLog);
    } else if (step.id.includes('docker-build')) {
      await simulateDockerBuild(appendToLog, step);
    } else if (step.id.includes('script')) {
      await simulateScriptExecution(step, appendToScriptOutput);
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
        // Add a small delay before starting the next step
        // This helps prevent the appearance of looping and gives visual feedback
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
