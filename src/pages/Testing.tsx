import React, { useState, useEffect } from "react";
import TestRunner from "@/components/TestRunner";
import IsoManager from "@/components/IsoManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Disc, FileText, Info, Check, X, Terminal, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsoGenerator } from "@/lib/testing/iso-generator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import DockerArchitecture from "@/components/DockerArchitecture";

const Testing: React.FC = () => {
  const [showAdvancedInfo, setShowAdvancedInfo] = useState<boolean>(false);
  const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);
  const [useDocker, setUseDocker] = useState<boolean>(false);
  const [checkingDocker, setCheckingDocker] = useState<boolean>(false);
  const [isoRefreshTrigger, setIsoRefreshTrigger] = useState<number>(0);
  const { toast } = useToast();
  
  // Check if Docker is available when the component mounts
  useEffect(() => {
    checkDockerAvailability();
  }, []);
  
  // Check Docker availability
  const checkDockerAvailability = async () => {
    setCheckingDocker(true);
    try {
      const isoGenerator = new IsoGenerator();
      const available = await isoGenerator.isDockerAvailable();
      setDockerAvailable(available);
      if (available) {
        setUseDocker(true);
      }
    } catch (error) {
      console.error("Error checking Docker:", error);
      setDockerAvailable(false);
    } finally {
      setCheckingDocker(false);
    }
  };
  
  // Toggle Docker usage
  const handleToggleDocker = (checked: boolean) => {
    if (checked && !dockerAvailable) {
      toast({
        title: "Docker Not Available",
        description: "Docker is not available on this system. Make sure Docker is installed and running.",
        variant: "destructive"
      });
      return;
    }
    
    setUseDocker(checked);
    
    // Update the IsoGenerator globally
    const isoGenerator = new IsoGenerator();
    isoGenerator.setUseDocker(checked);
    
    toast({
      title: checked ? "Docker Enabled" : "Docker Disabled",
      description: checked 
        ? "ISO generation will now use Docker for real ISO creation"
        : "ISO generation will use simulation mode"
    });
  };
  
  // Refresh ISO data
  const handleRefreshIsos = () => {
    setIsoRefreshTrigger(prev => prev + 1);
    
    toast({
      title: "ISO Data Refreshed",
      description: "The ISO information has been updated."
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">LFS Testing Framework</h1>
          <p className="text-gray-600">
            Test your LFS builds and generate bootable ISO images
          </p>
        </div>
        
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-medium">ISO Generation Mode</h2>
            <p className="text-sm text-gray-500">Select how ISO images are created</p>
          </div>
          <div className="flex items-center gap-4">
            {checkingDocker ? (
              <Badge variant="outline" className="animate-pulse">Checking Docker...</Badge>
            ) : (
              <Badge variant={dockerAvailable ? "secondary" : "destructive"} className="flex gap-1 items-center">
                {dockerAvailable ? <Check size={14} /> : <X size={14} />}
                Docker {dockerAvailable ? "Available" : "Not Available"}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm">Simulation</span>
              <Switch 
                checked={useDocker} 
                disabled={!dockerAvailable} 
                onCheckedChange={handleToggleDocker}
              />
              <span className="text-sm">Docker</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="runner" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="runner">Test Runner</TabsTrigger>
            <TabsTrigger value="iso" className="flex items-center gap-1">
              <Disc className="w-4 h-4" /> ISO Management
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-1">
              <Layers className="w-4 h-4" /> Architecture
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-1">
              <FileText className="w-4 h-4" /> Documentation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="runner">
            <TestRunner useDocker={useDocker} />
          </TabsContent>
          
          <TabsContent value="iso">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Disc className="h-5 w-5" />
                    ISO Generation
                  </CardTitle>
                  <CardDescription>
                    Generate bootable ISO images from successful LFS builds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      ISO generation creates bootable or non-bootable ISO images from your completed LFS builds.
                      Test configurations with <code className="px-1 py-0.5 bg-gray-100 rounded">iso_generation.generate</code> set to true
                      will automatically trigger ISO creation after a successful build.
                    </p>
                    
                    <Alert className={dockerAvailable && useDocker ? "bg-green-50 border-green-200" : ""}>
                      {dockerAvailable && useDocker ? (
                        <Terminal className="h-4 w-4 text-green-500" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {dockerAvailable && useDocker ? "Docker Mode" : "Simulation Mode"}
                      </AlertTitle>
                      <AlertDescription>
                        {dockerAvailable && useDocker ? (
                          "ISO generation will use Docker to create real bootable ISO images using xorriso."
                        ) : (
                          "The ISO generation is currently in simulation mode. In a production environment, it would use tools like xorriso or mkisofs to create real bootable ISO images."
                        )}
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
                      className="mt-2"
                    >
                      {showAdvancedInfo ? "Hide" : "Show"} Advanced Information
                    </Button>
                    
                    {showAdvancedInfo && (
                      <div className="mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold">How ISO Generation Works</h3>
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <h4 className="font-medium">Docker Mode (Real ISO creation)</h4>
                            <ol className="list-decimal pl-6 space-y-2 mt-2">
                              <li>Docker container is launched from an image with ISO creation tools</li>
                              <li>The LFS build directory is mounted as a read-only volume</li>
                              <li>An output volume is mounted for the generated ISO</li>
                              <li>The container runs xorriso to create a real bootable ISO image</li>
                              <li>The generated ISO is available for download</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium">Simulation Mode</h4>
                            <ol className="list-decimal pl-6 space-y-2 mt-2">
                              <li>A temporary directory structure is created</li>
                              <li>LFS build files are simulated</li>
                              <li>System configuration files are created</li>
                              <li>Bootloader files are added if ISO should be bootable</li>
                              <li>A simulated ISO file is created</li>
                              <li>Temporary files are cleaned up</li>
                            </ol>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mt-6">Docker Image Contents</h3>
                        <p>
                          The Docker image used for ISO generation contains:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Ubuntu 22.04 base system</li>
                          <li>xorriso for ISO creation</li>
                          <li>GRUB bootloader tools</li>
                          <li>ISOLINUX/SYSLINUX bootloader tools</li>
                          <li>Custom ISO generation script</li>
                        </ul>
                        
                        <h3 className="text-lg font-semibold mt-4">Using Generated ISOs</h3>
                        <p>
                          Generated ISO images can be:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Burned to optical media (CD/DVD)</li>
                          <li>Written to USB drives using dd or similar tools</li>
                          <li>Tested in virtual machines (like QEMU, VirtualBox, VMware)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    {useDocker ? 
                      "Using Docker for real ISO generation" : 
                      "Simulation mode active - real ISO creation disabled"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshIsos}
                    >
                      Refresh ISO List
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkDockerAvailability}
                      disabled={checkingDocker}
                    >
                      {checkingDocker ? "Checking..." : "Refresh Docker Status"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              {/* ISO Manager Component */}
              <IsoManager refreshTrigger={isoRefreshTrigger} />
            </div>
          </TabsContent>
          
          <TabsContent value="architecture">
            <DockerArchitecture dockerAvailable={dockerAvailable} />
          </TabsContent>
          
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Testing Documentation
                </CardTitle>
                <CardDescription>
                  Learn how to use the LFS testing framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Configurations</h3>
                  <p>
                    Test configurations define how your LFS build will be executed during testing.
                    You can use predefined configurations or create custom ones.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">Running Tests</h3>
                  <p>
                    Select a test configuration and click the "Run Test" button to start the test.
                    The test will simulate building LFS according to the selected configuration.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">Test Results</h3>
                  <p>
                    After the test completes, you'll see the results including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Test status (success or failure)</li>
                    <li>Build ID</li>
                    <li>Duration</li>
                    <li>Completed phases</li>
                    <li>Test logs</li>
                    <li>ISO download link (if ISO generation was enabled)</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mt-4">Docker Integration</h3>
                  <p>
                    When Docker is available and enabled:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>ISO generation will create real bootable ISO images</li>
                    <li>A Docker image with all needed tools will be automatically built</li>
                    <li>The LFS build files will be mounted into the Docker container</li>
                    <li>An actual ISO file will be created using industry-standard tools</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mt-4">ISO Management</h3>
                  <p>
                    The ISO Management tab provides a centralized way to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>View all generated ISO images</li>
                    <li>See details about each ISO (build ID, timestamp, configuration)</li>
                    <li>Download any ISO image</li>
                    <li>Filter ISOs by build ID or other criteria</li>
                    <li>View both current build ISOs and historical ISO files</li>
                  </ul>
                  
                  <p>
                    ISO files are stored in a central location and can be accessed at any time, even after the test run has completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Testing;
