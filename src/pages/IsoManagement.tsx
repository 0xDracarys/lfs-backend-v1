
import React, { useState, useEffect } from "react";
import MainNavigation from "../components/MainNavigation";
import IsoManager from "../components/IsoManager";
import DockerMonitor from "../components/DockerMonitor";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backendService } from "@/lib/testing/backend-service";
import { DockerService } from "@/lib/testing/docker-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disc, Download, ArrowRight, Server, Database, Docker, Activity } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

const IsoManagementPage = () => {
  const [isoRefreshTrigger, setIsoRefreshTrigger] = useState<number>(0);
  const [backendUrl, setBackendUrl] = useState<string>(
    import.meta.env.VITE_ISO_BACKEND_URL || "http://localhost:3000"
  );
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showDockerMonitor, setShowDockerMonitor] = useState<boolean>(false);
  const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);
  const [dockerService] = useState<DockerService>(() => new DockerService());
  const { toast: uiToast } = useToast();
  
  // Check Docker availability on component mount
  useEffect(() => {
    const checkDocker = async () => {
      try {
        const available = await dockerService.checkDockerAvailability();
        setDockerAvailable(available);
      } catch (error) {
        console.error("Error checking Docker availability:", error);
        setDockerAvailable(false);
      }
    };
    
    checkDocker();
  }, [dockerService]);
  
  const handleRefresh = () => {
    setIsoRefreshTrigger(prev => prev + 1);
  };
  
  const handleConnectBackend = async () => {
    setIsConnecting(true);
    
    try {
      const isAvailable = await backendService.checkApiAvailability();
      
      if (isAvailable) {
        setIsConnected(true);
        toast.success("Connected to ISO generation backend", {
          description: `Successfully connected to ${backendUrl}`
        });
      } else {
        toast.error("Failed to connect to backend", {
          description: "The backend service is not available at the specified URL"
        });
      }
    } catch (error) {
      toast.error("Connection error", {
        description: `Error connecting to backend: ${error}`
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Disc className="h-6 w-6" /> ISO Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your LFS ISO images and real ISO generation
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDockerMonitor(!showDockerMonitor)}
              className="flex items-center gap-1"
            >
              <Docker className="h-4 w-4" />
              {showDockerMonitor ? "Hide Docker Monitor" : "Show Docker Monitor"}
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button onClick={() => setIsConfiguring(true)}>
              Configure Backend
            </Button>
          </div>
        </div>
        
        {showDockerMonitor && (
          <div className="mb-6">
            <DockerMonitor dockerService={dockerService} />
          </div>
        )}
        
        {isConfiguring && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                ISO Backend Configuration
              </CardTitle>
              <CardDescription>
                Connect to a backend service for real ISO generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backend-url">Backend URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="backend-url"
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder="http://localhost:3000"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleConnectBackend}
                      disabled={isConnecting || !backendUrl}
                    >
                      {isConnecting ? "Connecting..." : "Connect"} {!isConnecting && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="font-medium mb-1">Backend Service Requirements:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Node.js server with Docker support</li>
                      <li>API endpoints for ISO generation</li>
                      <li>Secure connection between frontend and backend</li>
                      <li>Access to Docker daemon for container management</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="font-medium mb-1">Docker Status:</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`h-2 w-2 rounded-full ${
                        dockerAvailable === null 
                          ? "bg-gray-300" 
                          : dockerAvailable 
                            ? "bg-green-500" 
                            : "bg-red-500"
                      }`}></div>
                      <span>
                        {dockerAvailable === null 
                          ? "Checking availability..." 
                          : dockerAvailable 
                            ? "Docker is available" 
                            : "Docker is not available"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dockerAvailable 
                        ? "You can generate real ISOs locally using Docker" 
                        : "Install Docker to generate real ISOs locally"}
                    </p>
                  </div>
                </div>
                
                {isConnected && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm text-green-800">
                    Successfully connected to backend service at {backendUrl}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <Tabs defaultValue="all-isos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-isos">All ISO Images</TabsTrigger>
            <TabsTrigger value="real-isos">Real ISO Images</TabsTrigger>
            <TabsTrigger value="simulated-isos">Simulated ISO Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-isos">
            <IsoManager refreshTrigger={isoRefreshTrigger} />
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download ISO by Job ID
                  </CardTitle>
                  <CardDescription>
                    If you have a job ID from a previous ISO build, you can download it here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="job-id">Job ID</Label>
                      <Input
                        id="job-id"
                        placeholder="Enter ISO generation job ID"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="iso-name">ISO Name (optional)</Label>
                      <Input
                        id="iso-name"
                        placeholder="Custom ISO filename"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button>Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="real-isos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Real ISO Images
                </CardTitle>
                <CardDescription>
                  ISO images generated by the backend service with Docker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p>Real ISO images are generated using Docker containers. The process includes:</p>
                  
                  <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li className="text-gray-700">
                      <span className="font-medium">Container Creation</span> - A Docker container is created with all necessary tools
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">LFS Files Preparation</span> - Your LFS build files are copied to the container
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">Bootloader Configuration</span> - GRUB or ISOLINUX bootloader is set up
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">ISO Creation</span> - The xorriso tool creates a bootable ISO image
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">Verification</span> - The ISO is verified for integrity
                    </li>
                  </ol>
                  
                  <div className="bg-gray-50 p-3 rounded-md mt-4">
                    <p className="font-medium text-sm">Docker Container Details:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      ISO generation runs in a containerized environment based on Ubuntu 22.04 with 
                      all the necessary tools like xorriso, grub, and other utilities. This ensures
                      consistent ISO generation regardless of your host system.
                    </p>
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto mt-2" 
                      onClick={() => setShowDockerMonitor(true)}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Show Docker Monitor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simulated-isos">
            <Card>
              <CardHeader>
                <CardTitle>Simulated ISO Images</CardTitle>
                <CardDescription>
                  Simulated ISO images (browser-only, not real bootable ISOs)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This tab will show only simulated ISO images that were generated in the browser.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IsoManagementPage;
