
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEST_CONFIGURATIONS, getTestConfigurationByName, createCustomTestConfiguration } from "@/lib/testing/test-configurations";
import { LFSTestConfiguration, TestRunResult } from "@/lib/testing/types";
import { runTestBuild } from "@/lib/testing/test-runner";
import { toast } from "@/components/ui/use-toast";
import { ArrowDown, Play, Download, ListFilter } from "lucide-react";
import LogViewer from "./LogViewer";

const TestRunner: React.FC = () => {
  // State for test configuration selection and customization
  const [selectedConfigName, setSelectedConfigName] = useState<string>("");
  const [customConfig, setCustomConfig] = useState<{
    name: string;
    targetDisk: string;
    sourcesPath: string;
    scriptsPath: string;
    generateIso: boolean;
  }>({
    name: "Custom Test",
    targetDisk: "/dev/sdb",
    sourcesPath: "/path/to/sources",
    scriptsPath: "/path/to/scripts",
    generateIso: true
  });
  
  // State for test execution
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);
  
  // Handle test configuration selection
  const handleConfigSelect = (name: string) => {
    setSelectedConfigName(name);
  };
  
  // Handle custom configuration update
  const handleCustomConfigChange = (field: keyof typeof customConfig, value: any) => {
    setCustomConfig(prev => ({ ...prev, [field]: value }));
  };
  
  // Get current test configuration
  const getSelectedConfig = (): LFSTestConfiguration | null => {
    if (selectedConfigName === "custom") {
      return createCustomTestConfiguration(
        customConfig.name,
        customConfig.targetDisk,
        customConfig.sourcesPath,
        customConfig.scriptsPath,
        customConfig.generateIso
      );
    }
    
    return getTestConfigurationByName(selectedConfigName) || null;
  };
  
  // Run the selected test
  const handleRunTest = async () => {
    const config = getSelectedConfig();
    if (!config) {
      toast({
        title: "Configuration Error",
        description: "Please select a valid test configuration",
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    setTestResult(null);
    
    try {
      toast({
        title: "Test Started",
        description: `Running test: ${config.name}`,
      });
      
      const result = await runTestBuild(config);
      setTestResult(result);
      
      toast({
        title: result.status === "success" ? "Test Completed" : "Test Failed",
        description: result.status === "success" 
          ? `Test "${config.name}" completed successfully` 
          : `Test "${config.name}" failed${result.failedStep ? ` at step ${result.failedStep.stepId}` : ''}`,
        variant: result.status === "success" ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: `An unexpected error occurred: ${error}`,
        variant: "destructive"
      });
      console.error("Test execution error:", error);
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">LFS Builder Test Runner</h1>
      
      <Tabs defaultValue="predefined" className="mb-6">
        <TabsList>
          <TabsTrigger value="predefined">Predefined Tests</TabsTrigger>
          <TabsTrigger value="custom">Custom Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predefined" className="p-4 border rounded-md mt-2">
          <h2 className="text-lg font-semibold mb-4">Select a Predefined Test Configuration</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_CONFIGURATIONS.map((config) => (
              <Card 
                key={config.name} 
                className={`cursor-pointer transition-all ${
                  selectedConfigName === config.name ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleConfigSelect(config.name)}
              >
                <CardHeader>
                  <CardTitle>{config.name}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Disk:</span> {config.target_disk}</div>
                    <div><span className="font-medium">Generate ISO:</span> {config.iso_generation.generate ? 'Yes' : 'No'}</div>
                    <div>
                      <span className="font-medium">Expected Outcome:</span> 
                      {config.expected_outcomes.should_complete ? 'Complete' : 'Fail'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="p-4 border rounded-md mt-2">
          <h2 className="text-lg font-semibold mb-4">Create Custom Test Configuration</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Test Name</Label>
                <Input 
                  id="custom-name" 
                  value={customConfig.name} 
                  onChange={(e) => handleCustomConfigChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-disk">Target Disk</Label>
                <Input 
                  id="custom-disk" 
                  value={customConfig.targetDisk} 
                  onChange={(e) => handleCustomConfigChange('targetDisk', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-sources">Sources Path</Label>
                <Input 
                  id="custom-sources" 
                  value={customConfig.sourcesPath} 
                  onChange={(e) => handleCustomConfigChange('sourcesPath', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-scripts">Scripts Path</Label>
                <Input 
                  id="custom-scripts" 
                  value={customConfig.scriptsPath} 
                  onChange={(e) => handleCustomConfigChange('scriptsPath', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="custom-generate-iso"
                checked={customConfig.generateIso}
                onCheckedChange={(checked) => 
                  handleCustomConfigChange('generateIso', checked === true)
                }
              />
              <Label htmlFor="custom-generate-iso">Generate ISO after build</Label>
            </div>
            
            <Button 
              onClick={() => handleConfigSelect("custom")} 
              variant="secondary"
            >
              Use This Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center border-t border-b py-4 my-6">
        <div>
          {selectedConfigName && (
            <div className="text-lg">
              Selected: <span className="font-bold">{selectedConfigName === "custom" ? customConfig.name : selectedConfigName}</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleRunTest}
          disabled={!selectedConfigName || isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? "Running..." : "Run Test"} {!isRunning && <Play className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Test Results Section */}
      {testResult && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Test Results</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-medium">Status:</span> <span className={`${
                  testResult.status === 'success' ? 'text-green-600' : 'text-red-600'
                } font-bold`}>{testResult.status}</span></div>
                <div><span className="font-medium">Build ID:</span> {testResult.buildId}</div>
                <div><span className="font-medium">Duration:</span> {
                  testResult.endTime && testResult.startTime ? 
                  `${Math.round((new Date(testResult.endTime).getTime() - new Date(testResult.startTime).getTime()) / 1000)} seconds` : 
                  'In progress'
                }</div>
                <div><span className="font-medium">Phases Completed:</span> {testResult.completedPhases.join(', ')}</div>
                {testResult.failedStep && (
                  <div className="text-red-500">
                    <span className="font-medium">Failed at step:</span> {testResult.failedStep.stepId}
                    <div className="text-sm">{testResult.failedStep.error}</div>
                  </div>
                )}
              </CardContent>
              {testResult.isoGenerated && testResult.isoDownloadUrl && (
                <CardFooter>
                  <Button asChild className="w-full flex items-center justify-center gap-2">
                    <a href={testResult.isoDownloadUrl} download>
                      <Download className="h-4 w-4" /> Download ISO
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Test Logs
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ListFilter className="h-4 w-4" /> Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LogViewer logs={testResult.logs} maxHeight="300px" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;
