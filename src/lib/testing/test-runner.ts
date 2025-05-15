
import { LFSTestConfiguration, TestRunResult } from "./types";
import { saveBuildConfiguration, getBuildConfigurations } from "../supabase/configs";
import { startBuild, updateBuildStatus, getBuildsForConfiguration } from "../supabase/builds";
import { recordBuildStep, getBuildSteps } from "../supabase/steps";
import { BuildPhase, BuildStatus, LFS_BUILD_STEPS } from "../lfs-automation";
import { toast } from "@/components/ui/use-toast";
import { generateTestIso } from "./iso-generator";

/**
 * Run a test build using the provided test configuration
 */
export async function runTestBuild(testConfig: LFSTestConfiguration): Promise<TestRunResult> {
  const logs: string[] = [`Starting test build with configuration: ${testConfig.name}`];
  
  // Step 1: Create a build configuration in Supabase
  logs.push("Creating build configuration...");
  const buildConfig = await saveBuildConfiguration({
    name: `Test: ${testConfig.name}`,
    target_disk: testConfig.target_disk,
    sources_path: testConfig.sources_path,
    scripts_path: testConfig.scripts_path
  });
  
  if (!buildConfig) {
    logs.push("Failed to create build configuration");
    toast({
      title: "Test Failed",
      description: "Could not create build configuration",
      variant: "destructive"
    });
    return {
      configId: "",
      buildId: "",
      startTime: new Date(),
      endTime: new Date(),
      status: "failed",
      completedPhases: [],
      logs
    };
  }
  
  logs.push(`Created build configuration with ID: ${buildConfig.id}`);
  
  // Step 2: Start a new build
  logs.push("Starting build process...");
  const buildRecord = await startBuild(buildConfig.id);
  
  if (!buildRecord) {
    logs.push("Failed to start build process");
    toast({
      title: "Test Failed",
      description: "Could not start build process",
      variant: "destructive"
    });
    return {
      configId: buildConfig.id || "",
      buildId: "",
      startTime: new Date(),
      endTime: new Date(),
      status: "failed",
      completedPhases: [],
      logs
    };
  }
  
  logs.push(`Started build with ID: ${buildRecord.id}`);
  
  const result: TestRunResult = {
    configId: buildConfig.id || "",
    buildId: buildRecord.id || "",
    startTime: new Date(),
    status: "in_progress",
    completedPhases: [],
    isoGenerated: false,
    logs
  };
  
  // Step 3: Begin simulating the build process
  try {
    await simulateBuildProcess(buildRecord.id || "", testConfig, result);
  } catch (error) {
    logs.push(`Build simulation failed: ${error}`);
    result.status = "failed";
    result.endTime = new Date();
  }
  
  // Step 4: Generate ISO if configured and build was successful
  if (testConfig.iso_generation.generate && result.status === "completed") {
    logs.push("Generating ISO image...");
    try {
      const isoUrl = await generateTestIso(buildRecord.id || "", testConfig.iso_generation.minimal_iso);
      
      if (isoUrl) {
        result.isoGenerated = true;
        result.isoDownloadUrl = isoUrl;
        logs.push(`ISO generated successfully. Download URL: ${isoUrl}`);
      } else {
        logs.push("ISO generation failed");
      }
    } catch (error) {
      logs.push(`ISO generation error: ${error}`);
    }
  }
  
  result.logs = logs;
  return result;
}

/**
 * Simulate the build process
 */
async function simulateBuildProcess(
  buildId: string, 
  testConfig: LFSTestConfiguration,
  result: TestRunResult
): Promise<void> {
  const { logs } = result;
  
  // Organize steps by phase
  const stepsByPhase = LFS_BUILD_STEPS.reduce<Record<BuildPhase, typeof LFS_BUILD_STEPS>>((acc, step) => {
    if (!acc[step.phase]) {
      acc[step.phase] = [];
    }
    acc[step.phase].push(step);
    return acc;
  }, {} as Record<BuildPhase, typeof LFS_BUILD_STEPS>);
  
  // Track current phase
  let currentPhase: BuildPhase = BuildPhase.INITIAL_SETUP;
  
  // Process each phase
  for (const phase of Object.values(BuildPhase)) {
    logs.push(`Starting phase: ${phase}`);
    
    // Update build status with the current phase
    await updateBuildStatus(
      buildId,
      "in_progress",
      phase as BuildPhase,
      null,
      calcProgressPercentage(currentPhase)
    );
    
    // Process each step in the phase
    const steps = stepsByPhase[phase as BuildPhase] || [];
    for (const step of steps) {
      logs.push(`Processing step: ${step.name}`);
      
      // Mark step as in progress
      await recordBuildStep(buildId, step.id, BuildStatus.IN_PROGRESS);
      
      // Simulate step execution time
      const executionTimeMs = Math.random() * 1000 + 500; // 500-1500ms
      await new Promise(resolve => setTimeout(resolve, executionTimeMs));
      
      // Handle steps that require user input
      if (step.requiresInput && testConfig.user_inputs[step.id]) {
        logs.push(`Providing simulated user input for step: ${step.id}`);
        // In a real implementation, you'd handle the input through the API
      }
      
      // Simulate potential failure based on test configuration
      const shouldFail = !testConfig.expected_outcomes.should_complete && 
                        Math.random() < 0.3; // 30% chance of failure if test is expected to fail
      
      if (shouldFail) {
        logs.push(`Simulating failure for step: ${step.id}`);
        await recordBuildStep(buildId, step.id, BuildStatus.FAILED, `Test simulated failure: ${step.id}`);
        
        // Update build status as failed
        await updateBuildStatus(
          buildId,
          "failed",
          currentPhase,
          step.id,
          calcProgressPercentage(currentPhase)
        );
        
        result.status = "failed";
        result.failedStep = {
          stepId: step.id,
          error: "Simulated test failure"
        };
        result.endTime = new Date();
        return;
      }
      
      // Mark step as completed
      logs.push(`Completing step: ${step.name}`);
      await recordBuildStep(buildId, step.id, BuildStatus.COMPLETED, `Test simulated success: ${step.id}`);
    }
    
    // Mark phase as completed
    currentPhase = getNextPhase(currentPhase);
    result.completedPhases.push(phase as BuildPhase);
    
    // Check if we should stop after this phase based on test configuration
    if (
      testConfig.expected_outcomes.expected_phases_to_complete &&
      testConfig.expected_outcomes.expected_phases_to_complete.indexOf(phase as BuildPhase) === 
      testConfig.expected_outcomes.expected_phases_to_complete.length - 1
    ) {
      logs.push(`Test configuration specifies stopping after phase: ${phase}`);
      break;
    }
  }
  
  // Update build status as completed
  await updateBuildStatus(
    buildId,
    "completed",
    currentPhase,
    null,
    100
  );
  
  result.status = "completed";
  result.endTime = new Date();
  logs.push("Build simulation completed successfully");
}

/**
 * Calculate approximate progress percentage based on current phase
 */
function calcProgressPercentage(currentPhase: BuildPhase): number {
  const phaseWeights: Record<BuildPhase, number> = {
    [BuildPhase.INITIAL_SETUP]: 10,
    [BuildPhase.LFS_USER_BUILD]: 30,
    [BuildPhase.CHROOT_SETUP]: 50, 
    [BuildPhase.CHROOT_BUILD]: 70,
    [BuildPhase.SYSTEM_CONFIGURATION]: 90,
    [BuildPhase.FINAL_STEPS]: 100
  };
  
  return phaseWeights[currentPhase] || 0;
}

/**
 * Get the next build phase
 */
function getNextPhase(currentPhase: BuildPhase): BuildPhase {
  const phases = Object.values(BuildPhase);
  const currentIndex = phases.indexOf(currentPhase);
  
  if (currentIndex < phases.length - 1) {
    return phases[currentIndex + 1] as BuildPhase;
  }
  
  return currentPhase;
}
