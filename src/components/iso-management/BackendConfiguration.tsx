import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import React, { useState, useEffect } from "react"; // Added useState, useEffect
import { ArrowRight, Server, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { toast } from "sonner";
import { backendService } from "@/lib/testing/services/backend-service";

interface BackendConfigurationProps {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isConnecting: boolean;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  dockerAvailable: boolean | null;
  onClose: () => void;
}

const BackendConfiguration = ({
  backendUrl,
  setBackendUrl,
  isConnecting,
  setIsConnecting,
  setIsConnected,
  dockerAvailable,
  onClose,
}: BackendConfigurationProps) => {
  const [isServiceGloballyConfigured, setIsServiceGloballyConfigured] = useState<boolean>(true); // Default to true to avoid flash of disabled

  useEffect(() => {
    setIsServiceGloballyConfigured(backendService.isApiConfigured());
  }, []);
  
  const handleConnectBackend = async () => {
    if (!isServiceGloballyConfigured) {
      toast.error("Backend URL Not Configured", {
        description: "The VITE_ISO_BACKEND_URL is not set in the environment.",
      });
      return;
    }
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
        {!isServiceGloballyConfigured && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-700 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              The ISO Backend URL (VITE_ISO_BACKEND_URL) is not configured in the application's environment.
              Real ISO generation via a remote backend is disabled. You can still use local Docker if available.
            </p>
          </div>
        )}
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
                disabled={!isServiceGloballyConfigured || isConnecting}
              />
              <Button 
                onClick={handleConnectBackend}
                disabled={!isServiceGloballyConfigured || isConnecting || !backendUrl}
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BackendConfiguration;
