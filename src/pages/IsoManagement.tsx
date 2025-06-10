
import React, { useState, useEffect } from "react";
import MainNavigation from "../components/MainNavigation";
import DockerMonitor from "../components/DockerMonitor";
import { DockerService } from "@/lib/testing/docker-service";
import { useToast } from "@/components/ui/use-toast";
import HeaderSection from "@/components/iso-management/HeaderSection";
import BackendConfiguration from "@/components/iso-management/BackendConfiguration";
import IsoTabs from "@/components/iso-management/IsoTabs";
import type { Session } from '@supabase/supabase-js'; // Import Session type
import { backendService } from "@/lib/testing/services/backend-service"; // Import backendService

interface IsoManagementPageProps {
  session?: Session | null; // Make session optional for now
}

const IsoManagementPage: React.FC<IsoManagementPageProps> = ({ session }) => {
  // State management
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
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(false); // State for API config status
  
  // Check Docker availability and API configuration on component mount
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
    setIsApiConfigured(backendService.isApiConfigured()); // Check API config status
  }, [dockerService]);
  
  const handleRefresh = () => {
    setIsoRefreshTrigger(prev => prev + 1);
  };
  
  const handleToggleDockerMonitor = () => {
    setShowDockerMonitor(!showDockerMonitor);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6">
        {session?.user && <p className="text-sm text-gray-600 mb-1">User: {session.user.email}</p>}
        <HeaderSection 
          showDockerMonitor={showDockerMonitor}
          onToggleDockerMonitor={handleToggleDockerMonitor}
          onRefresh={handleRefresh}
          onConfigureBackend={() => setIsConfiguring(true)}
        />
        
        {showDockerMonitor && (
          <div className="mb-6">
            <DockerMonitor dockerService={dockerService} />
          </div>
        )}
        
        {isConfiguring && (
          <BackendConfiguration
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
            isConnecting={isConnecting}
            setIsConnecting={setIsConnecting}
            setIsConnected={setIsConnected}
            dockerAvailable={dockerAvailable}
            onClose={() => setIsConfiguring(false)}
          />
        )}
        
        <IsoTabs 
          refreshTrigger={isoRefreshTrigger} 
          onShowDockerMonitor={() => setShowDockerMonitor(true)}
          apiConfigured={isApiConfigured} // Pass prop down
        />
      </div>
    </div>
  );
};

export default IsoManagementPage;
