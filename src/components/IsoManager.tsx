
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Disc, Info, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { IsoGenerator, IsoMetadata } from "@/lib/testing/iso-generator";
import { format } from "date-fns";

interface IsoManagerProps {
  currentBuildId?: string;
  refreshTrigger?: number;
}

const IsoManager: React.FC<IsoManagerProps> = ({ currentBuildId, refreshTrigger = 0 }) => {
  const [allIsos, setAllIsos] = useState<IsoMetadata[]>([]);
  const [buildIsos, setBuildIsos] = useState<IsoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"current" | "all">("current");
  const { toast } = useToast();
  
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
    } catch (error) {
      console.error("Error loading ISO metadata:", error);
      toast({
        title: "Error Loading ISO Data",
        description: "Failed to load ISO information. This may be due to running in a browser environment.",
        variant: "destructive"
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
    const downloadUrl = `/api/iso/${iso.buildId}/${iso.isoName}`;
    
    toast({
      title: "Download Started",
      description: `Downloading ${iso.isoName}...`,
    });
    
    // In a real application, this would trigger the actual download
    window.open(downloadUrl, "_blank");
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
                {isoData.map((iso, i) => (
                  <TableRow key={`${iso.buildId}-${iso.isoName}-${i}`}>
                    <TableCell className="font-medium">{iso.isoName}</TableCell>
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
                      <Button 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleDownload(iso)}
                      >
                        <FileDown className="h-4 w-4" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
