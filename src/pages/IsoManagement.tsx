
import React, { useState } from "react";
import MainNavigation from "../components/MainNavigation";
import IsoManager from "../components/IsoManager";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backendService } from "@/lib/testing/backend-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disc, Download, ArrowRight, Server } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const IsoManagementPage = () => {
  const [isoRefreshTrigger, setIsoRefreshTrigger] = useState<number>(0);
  const [backendUrl, setBackendUrl] = useState<string>(
    process.env.ISO_BACKEND_URL || "http://localhost:3000"
  );
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { toast } = useToast();
  
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
            <Button variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button onClick={() => setIsConfiguring(true)}>
              Configure Backend
            </Button>
          </div>
        </div>
        
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
                
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Backend Service Requirements:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Node.js server with Docker support</li>
                    <li>API endpoints for ISO generation</li>
                    <li>Secure connection between frontend and backend</li>
                    <li>Access to Docker daemon for container management</li>
                  </ul>
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
                <CardTitle>Real ISO Images</CardTitle>
                <CardDescription>
                  ISO images generated by the backend service with Docker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This tab will show only real ISO images generated using Docker and the backend service.</p>
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
