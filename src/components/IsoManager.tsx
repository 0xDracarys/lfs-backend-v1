
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { IsoGenerator, IsoMetadata } from "@/lib/testing/iso-generator";
import { backendService } from "@/lib/testing/services/backend-service";
import { createPlaceholderData } from "./iso-management/utils/iso-utils";
import IsoLoading from "./iso-management/IsoLoading";
import EmptyIsoState from "./iso-management/EmptyIsoState";
import IsoTable from "./iso-management/IsoTable";

// Extend the IsoMetadata type to include jobId
declare module "@/lib/testing/iso-generator" {
  interface IsoMetadata {
    jobId?: string;
  }
}

interface IsoManagerProps {
  currentBuildId?: string;
  refreshTrigger?: number;
}

const IsoManager: React.FC<IsoManagerProps> = ({ currentBuildId, refreshTrigger = 0 }) => {
  const [allIsos, setAllIsos] = useState<IsoMetadata[]>([]);
  const [buildIsos, setBuildIsos] = useState<IsoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"current" | "all">("current");
  const [generatingIsos, setGeneratingIsos] = useState<Record<string, {
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    message?: string;
    jobId?: string;
  }>>({});
  
  // Set up polling interval for job status
  useEffect(() => {
    // Only set up polling if there are active jobs
    const activeJobs = Object.entries(generatingIsos).filter(
      ([_, job]) => job.status === "pending" || job.status === "processing"
    );
    
    if (activeJobs.length === 0) return;
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      activeJobs.forEach(async ([isoName, job]) => {
        if (!job.jobId) return;
        
        try {
          const status = await backendService.checkIsoGenerationStatus(job.jobId);
          
          setGeneratingIsos(prev => ({
            ...prev,
            [isoName]: {
              ...prev[isoName],
              status: status.status,
              progress: status.progress || prev[isoName].progress,
              message: status.message
            }
          }));
          
          // If job is complete or failed, show a toast
          if (status.status === "completed" && generatingIsos[isoName]?.status !== "completed") {
            toast.success(`ISO generation completed: ${isoName}`, {
              description: status.message || "Your ISO is ready to download!"
            });
            
            // Refresh ISO list after job completion
            loadIsoData();
          } else if (status.status === "failed" && generatingIsos[isoName]?.status !== "failed") {
            toast.error(`ISO generation failed: ${isoName}`, {
              description: status.message || "There was a problem generating your ISO."
            });
          }
        } catch (error) {
          console.warn(`Error checking ISO status for ${isoName}:`, error);
        }
      });
    }, 3000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [generatingIsos]);
  
  useEffect(() => {
    loadIsoData();
  }, [currentBuildId, refreshTrigger]);
  
  const loadIsoData = async () => {
    setIsLoading(true);
    
    try {
      const isoGenerator = new IsoGenerator();
      
      // Load all available ISO metadata
      const allMetadata = await isoGenerator.getAllIsoMetadata();
      setAllIsos(allMetadata);
      
      // If a current build ID is provided, filter for that build
      if (currentBuildId) {
        const buildSpecificIsos = await isoGenerator.getIsoMetadataByBuildId(currentBuildId);
        setBuildIsos(buildSpecificIsos);
      } else {
        setBuildIsos([]);
      }
      
      // Check for any in-progress ISO generations
      const newGeneratingIsos = { ...generatingIsos };
      let hasChanges = false;
      
      for (const isoId in newGeneratingIsos) {
        if (newGeneratingIsos[isoId].status === "pending" || newGeneratingIsos[isoId].status === "processing") {
          try {
            if (newGeneratingIsos[isoId].jobId) {
              const status = await backendService.checkIsoGenerationStatus(newGeneratingIsos[isoId].jobId!);
              
              if (status.status !== newGeneratingIsos[isoId].status || 
                  status.progress !== newGeneratingIsos[isoId].progress) {
                newGeneratingIsos[isoId] = {
                  status: status.status,
                  progress: status.progress || newGeneratingIsos[isoId].progress,
                  message: status.message,
                  jobId: newGeneratingIsos[isoId].jobId
                };
                hasChanges = true;
                
                if (status.status === "completed") {
                  toast.success(`ISO generation completed: ${isoId}`, {
                    description: status.message || "Your ISO is ready to download!"
                  });
                } else if (status.status === "failed") {
                  toast.error(`ISO generation failed: ${isoId}`, {
                    description: status.message || "There was a problem generating your ISO."
                  });
                }
              }
            }
          } catch (error) {
            console.warn(`Error checking ISO status for ${isoId}:`, error);
          }
        }
      }
      
      if (hasChanges) {
        setGeneratingIsos(newGeneratingIsos);
      }
    } catch (error) {
      console.error("Error loading ISO metadata:", error);
      toast.error("Error Loading ISO Data", {
        description: "Failed to load ISO information. This may be due to running in a browser environment."
      });
      
      // Set placeholder data for demonstration
      const placeholderData = createPlaceholderData(currentBuildId || "build-demo");
      setAllIsos(placeholderData);
      setBuildIsos(currentBuildId ? placeholderData : []);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateRealIso = async (iso: IsoMetadata) => {
    try {
      setGeneratingIsos(prev => ({
        ...prev,
        [iso.isoName]: {
          status: "pending",
          progress: 0,
          message: "Initializing real ISO generation..."
        }
      }));
      
      toast.info("Starting ISO generation", {
        description: "Sending request to generate a real bootable ISO..."
      });
      
      // Request ISO generation from the backend
      const result = await backendService.requestIsoGeneration({
        buildId: iso.buildId,
        sourceDir: `/tmp/builds/${iso.buildId}/lfs`,
        outputPath: `/tmp/iso/${iso.buildId}/${iso.isoName}`,
        label: iso.label || "LFS",
        bootable: iso.bootable,
        bootloader: (iso.bootloader as "grub" | "isolinux" | "none") || "grub",
      });
      
      if (result.jobId) {
        setGeneratingIsos(prev => ({
          ...prev,
          [iso.isoName]: {
            status: "processing",
            progress: 5,
            message: "ISO generation in progress...",
            jobId: result.jobId
          }
        }));
        
        toast.success("ISO generation started", {
          description: `Job ID: ${result.jobId}`
        });
        
        // Initial status check
        try {
          const status = await backendService.checkIsoGenerationStatus(result.jobId);
          
          setGeneratingIsos(prev => ({
            ...prev,
            [iso.isoName]: {
              status: status.status,
              progress: status.progress || 5,
              message: status.message || "ISO generation in progress...",
              jobId: result.jobId
            }
          }));
        } catch (error) {
          console.error("Error checking initial ISO status:", error);
        }
      } else {
        toast.error("Failed to start ISO generation", {
          description: "No job ID returned from the backend."
        });
      }
    } catch (error) {
      console.error("Error generating real ISO:", error);
      toast.error("ISO generation failed", {
        description: `Error: ${error}`
      });
      
      setGeneratingIsos(prev => ({
        ...prev,
        [iso.isoName]: {
          status: "failed",
          progress: 0,
          message: `Error: ${error}`
        }
      }));
    }
  };
  
  const isoData = activeTab === "current" ? buildIsos : allIsos;
  const showAllTab = allIsos.length > 0;
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="h-5 w-5" />
            <div>
              <CardTitle>ISO Images</CardTitle>
              <CardDescription>
                {activeTab === "current" 
                  ? "ISO images for the current build" 
                  : "All available ISO images"}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {showAllTab && (
              <div className="flex bg-gray-100 rounded-md p-0.5">
                <button 
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    activeTab === "current" ? "bg-white shadow-sm" : ""
                  }`}
                  onClick={() => setActiveTab("current")}
                >
                  Current Build
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    activeTab === "all" ? "bg-white shadow-sm" : ""
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  All ISOs
                </button>
              </div>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={loadIsoData} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <IsoLoading />
        ) : isoData.length === 0 ? (
          <EmptyIsoState activeTab={activeTab} currentBuildId={currentBuildId} />
        ) : (
          <IsoTable 
            isoData={isoData} 
            generatingIsos={generatingIsos}
            onGenerateRealIso={handleGenerateRealIso} 
          />
        )}
      </CardContent>
      {isoData.length > 0 && (
        <CardFooter>
          <p className="text-sm text-gray-500">
            Total ISO images: {isoData.length}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default IsoManager;
