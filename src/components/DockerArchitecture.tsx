
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { DockerDiagram, ProcessFlow, DockerFeatures, DockerRequirements } from "./docker";
import { Button } from "@/components/ui/button";

interface DockerArchitectureProps {
  dockerAvailable?: boolean | null;
}

/**
 * Component that displays the Docker architecture and integration details
 * Shows diagrams, process flows, features, and requirements
 */
const DockerArchitecture: React.FC<DockerArchitectureProps> = ({ dockerAvailable = null }) => {
  const [showRequirements, setShowRequirements] = useState(false);
  
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6" />
            <CardTitle>Docker Integration Architecture</CardTitle>
          </div>
          <CardDescription>
            How LFS Builder leverages Docker for reproducible builds and ISO generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <DockerDiagram />
          <ProcessFlow />
        </CardContent>
      </Card>
      
      <DockerFeatures />
      
      {showRequirements && <DockerRequirements dockerAvailable={dockerAvailable} />}
      
      <div className="flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setShowRequirements(!showRequirements)}
          className="text-sm"
        >
          {showRequirements ? "Hide Requirements" : "Show Docker Requirements"}
        </Button>
      </div>
    </div>
  );
};

export default DockerArchitecture;
