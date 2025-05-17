
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DockerRequirementsProps {
  dockerAvailable?: boolean | null;
}

const DockerRequirements: React.FC<DockerRequirementsProps> = ({ dockerAvailable }) => {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold">Docker Requirements</h3>
      
      <Alert className={dockerAvailable ? "border-green-200" : "border-amber-200"}>
        {dockerAvailable === true ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : dockerAvailable === false ? (
          <XCircle className="h-4 w-4 text-red-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        )}
        <AlertTitle>
          {dockerAvailable === true
            ? "Docker is available"
            : dockerAvailable === false
            ? "Docker is not available"
            : "Docker status unknown"}
        </AlertTitle>
        <AlertDescription>
          {dockerAvailable === true ? (
            <p>Docker is properly installed and running on your system. LFS Builder can use Docker for ISO generation.</p>
          ) : dockerAvailable === false ? (
            <p>Docker is not available on your system. You'll need to install Docker to use full ISO generation capabilities.</p>
          ) : (
            <p>Docker availability has not been checked. Check Docker status in the testing tab.</p>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <h4 className="font-medium">System Requirements:</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Docker Engine installed and running</li>
          <li>User permissions to execute Docker commands</li>
          <li>At least 10GB free disk space for Docker images and containers</li>
          <li>Network connectivity for Docker image downloads</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Docker Image Details:</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Base: Ubuntu 22.04</li>
          <li>Size: ~600MB</li>
          <li>Key packages: xorriso, grub, syslinux, binutils, build-essential</li>
          <li>Custom scripts for ISO generation</li>
        </ul>
      </div>
    </div>
  );
};

export default DockerRequirements;
