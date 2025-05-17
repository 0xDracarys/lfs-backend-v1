
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { DockerDiagram, ProcessFlow, DockerFeatures, DockerRequirements } from "./docker";

interface DockerArchitectureProps {
  dockerAvailable?: boolean | null;
}

const DockerArchitecture: React.FC<DockerArchitectureProps> = ({ dockerAvailable = null }) => {
  const [showRequirements, setShowRequirements] = useState(false);
  
  return (
    <div className="p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6" />
            <CardTitle>Docker Integration Architecture</CardTitle>
          </div>
          <CardDescription>
            How LFS Builder leverages Docker for reproducible builds and ISO generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DockerDiagram />
          <ProcessFlow />
        </CardContent>
      </Card>
      
      <DockerFeatures />
      
      {showRequirements && <DockerRequirements dockerAvailable={dockerAvailable} />}
      
      <div className="mt-6 flex justify-center">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          onClick={() => setShowRequirements(!showRequirements)}
        >
          {showRequirements ? "Hide Requirements" : "Show Docker Requirements"}
        </button>
      </div>
    </div>
  );
};

export default DockerArchitecture;
