import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Disc, Info, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { IsoGenerator, IsoMetadata } from "@/lib/testing/iso-generator";
import { format } from "date-fns";
import { backendService } from "@/lib/testing/backend-service";
import { Progress } from "@/components/ui/progress";

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
  
  const handleDownload = (iso: IsoMetadata) => {
    try {
      if (iso.jobId) {
        // If this ISO was created by the backend service
        backendService.downloadIso(iso.jobId, iso.isoName);
      } else {
        // In a real application with a backend, we would have a real download endpoint
        // For now, we'll simulate a download by creating a dummy file
        toast.info("Simulated Download", {
          description: `In a production environment, this would download ${iso.isoName}`
        });
        
        // Create a blob with some text content to simulate the ISO file
        const blob = new Blob([`This is a simulated ISO file: ${iso.isoName}\n
Build ID: ${iso.buildId}\n
Created: ${iso.timestamp}\n
Configuration: ${iso.configName}\n
This is just a simulation as we don't have a real server to generate actual ISO files.`], 
        { type: 'text/plain' });
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = iso.isoName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast.error("Download failed", {
        description: `Error downloading ISO: ${error}`
      });
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
        
        // Start polling for status
        const intervalId = setInterval(async () => {
          try {
            const status = await backendService.checkIsoGenerationStatus(result.jobId);
            
            setGeneratingIsos(prev => ({
              ...prev,
              [iso.isoName]: {
                status: status.status,
                progress: status.progress || prev[iso.isoName].progress,
                message: status.message,
                jobId: result.jobId
              }
            }));
            
            if (status.status === "completed" || status.status === "failed") {
              clearInterval(intervalId);
              
              if (status.status === "completed") {
                toast.success("ISO generation completed", {
                  description: "Your ISO is ready to download!"
                });
                
                // Refresh the ISO list
                loadIsoData();
              } else if (status.status === "failed") {
                toast.error("ISO generation failed", {
                  description: status.message || "There was a problem generating your ISO."
                });
              }
            }
          } catch (error) {
            console.error("Error checking ISO status:", error);
            clearInterval(intervalId);
          }
        }, 3000);
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
  
  // Helper to create placeholder data for browser demo
  const createPlaceholderData = (buildId: string): IsoMetadata[] => {
    return [
      {
        buildId,
        isoName: "lfs-base-11.3.iso",
        timestamp: new Date().toISOString(),
        configName: "Basic LFS",
        outputPath: `/tmp/iso/${buildId}/lfs-base-11.3.iso`,
        bootable: true,
        bootloader: "grub",
        label: "LFS_BASE"
      },
      {
        buildId,
        isoName: "lfs-extended-11.3.iso",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        configName: "Extended LFS",
        outputPath: `/tmp/iso/${buildId}/lfs-extended-11.3.iso`,
        bootable: true,
        bootloader: "grub",
        label: "LFS_EXT"
      }
    ];
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
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <Disc className="h-8 w-8 text-gray-300 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Loading ISO data...</p>
            </div>
          </div>
        ) : isoData.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <Info className="h-8 w-8 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-gray-600 font-medium">No ISO images available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "current" && currentBuildId 
                ? "No ISO images have been generated for this build yet." 
                : "No ISO images have been generated."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ISO Name</TableHead>
                  <TableHead>Build</TableHead>
                  <TableHead>Generated On</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isoData.map((iso, i) => {
                  const isGenerating = generatingIsos[iso.isoName] !== undefined;
                  const generationStatus = isGenerating ? generatingIsos[iso.isoName] : null;
                  
                  return (
                    <TableRow key={`${iso.buildId}-${iso.isoName}-${i}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {iso.isoName}
                          {generationStatus?.status === "completed" && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {iso.buildId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {format(new Date(iso.timestamp), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{iso.configName}</TableCell>
                      <TableCell>
                        <Badge variant={iso.bootable ? "default" : "outline"}>
                          {iso.bootable ? `Bootable (${iso.bootloader})` : "Data only"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isGenerating && generationStatus?.status !== "completed" && (
                            <div className="w-full max-w-[200px]">
                              <Progress value={generationStatus?.progress || 0} className="h-2 mb-1" />
                              <p className="text-xs text-gray-500">
                                {generationStatus?.status === "failed" ? (
                                  <span className="text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Failed
                                  </span>
                                ) : (
                                  `${generationStatus?.status}: ${generationStatus?.progress || 0}%`
                                )}
                              </p>
                            </div>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => handleGenerateRealIso(iso)}
                            disabled={isGenerating && generationStatus?.status !== "failed"}
                          >
                            Generate Real ISO
                          </Button>
                          
                          <Button 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleDownload(iso)}
                          >
                            <FileDown className="h-4 w-4" /> Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
