
import React from "react";
import MainNavigation from "../components/MainNavigation";
import TestRunner from "../components/TestRunner";
import DockerSetup from "../components/DockerSetup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Testing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">LFS Testing & ISO Generation</h1>
        
        <Tabs defaultValue="test-runner" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="test-runner">Test Runner</TabsTrigger>
            <TabsTrigger value="docker-setup">Docker Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test-runner">
            <TestRunner useDocker={true} />
          </TabsContent>
          
          <TabsContent value="docker-setup">
            <DockerSetup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Testing;
