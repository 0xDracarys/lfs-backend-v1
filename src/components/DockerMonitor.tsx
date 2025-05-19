
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Terminal, Activity, Box, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DockerService } from "@/lib/testing/docker-service";

interface DockerMonitorProps {
  dockerService?: DockerService;
  showLogs?: boolean;
  refreshInterval?: number; // in milliseconds
}

const DockerMonitor: React.FC<DockerMonitorProps> = ({ 
  dockerService = new DockerService(),
  showLogs = true,
  refreshInterval = 2000
}) => {
  const [containerStatus, setContainerStatus] = useState<{
    running: boolean;
    containerId: string | null;
    startTime: Date | null;
    progress: number;
    logs: string[];
    lastUpdated: Date | null;
  }>({
    running: false,
    containerId: null,
    startTime: null,
    progress: 0,
    logs: [],
    lastUpdated: null
  });
  
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  
  // Set up periodic refresh for container status
  useEffect(() => {
    // Initial fetch
    updateContainerStatus();
    
    // Register for status updates from the Docker service
    const unsubscribe = dockerService.onStatusUpdate((status) => {
      setContainerStatus(status);
    });
    
    // Set up interval for polling if auto-refresh is enabled
    let interval: number | undefined;
    if (autoRefresh) {
      interval = window.setInterval(() => {
        updateContainerStatus();
      }, refreshInterval);
    }
    
    // Clean up
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      unsubscribe();
    };
  }, [dockerService, autoRefresh, refreshInterval]);
  
  // Function to manually refresh container status
  const updateContainerStatus = () => {
    const status = dockerService.getContainerStatus();
    setContainerStatus(status);
  };
  
  // Function to stop the current container
  const handleStopContainer = async () => {
    if (containerStatus.running && containerStatus.containerId) {
      await dockerService.stopContainer();
      updateContainerStatus();
    }
  };
  
  // Calculate runtime if container is running
  const getRuntimeDisplay = () => {
    if (!containerStatus.startTime) {
      return "Not started";
    }
    
    const now = new Date();
    const startTime = new Date(containerStatus.startTime);
    const diffMs = now.getTime() - startTime.getTime();
    
    // Format as minutes:seconds
    const diffSec = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">Docker Container Monitor</CardTitle>
              <CardDescription>
                Monitor active ISO generation containers
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={containerStatus.running ? "default" : "outline"}
            className={`${containerStatus.running ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            {containerStatus.running ? "RUNNING" : "INACTIVE"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {containerStatus.containerId ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Terminal className="h-4 w-4" /> Container ID
                </div>
                <div className="text-sm font-mono bg-gray-100 p-1 rounded">
                  {containerStatus.containerId}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Runtime
                </div>
                <div className="text-sm font-mono bg-gray-100 p-1 rounded">
                  {getRuntimeDisplay()}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Activity className="h-4 w-4" /> Progress
                </div>
                <span className="text-sm font-mono">{containerStatus.progress}%</span>
              </div>
              <Progress value={containerStatus.progress} className="h-2" />
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-xs"
              >
                {autoRefresh ? "Pause Updates" : "Resume Updates"}
              </Button>
              
              {containerStatus.running && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleStopContainer}
                  className="text-xs"
                >
                  Stop Container
                </Button>
              )}
            </div>
            
            {showLogs && containerStatus.logs.length > 0 && (
              <div className="mt-2">
                <Separator className="my-2" />
                <div className="text-sm font-medium text-gray-700 mb-1">Container Logs</div>
                <div className="bg-black text-gray-200 p-2 rounded-md text-xs font-mono h-[200px] overflow-y-auto">
                  {containerStatus.logs.map((log, index) => (
                    <div key={index} className="leading-5">
                      <span className="text-green-400">$</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Terminal className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No active Docker containers</p>
            <p className="text-xs mt-1">
              Start an ISO generation process to see container details
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500 pt-0">
        Last updated: {containerStatus.lastUpdated 
          ? new Date(containerStatus.lastUpdated).toLocaleTimeString() 
          : 'Never'}
      </CardFooter>
    </Card>
  );
};

export default DockerMonitor;
