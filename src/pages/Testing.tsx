
import React, { useState } from "react";
import TestRunner from "@/components/TestRunner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Disc, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testing: React.FC = () => {
  const [showAdvancedInfo, setShowAdvancedInfo] = useState<boolean>(false);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">LFS Testing Framework</h1>
          <p className="text-gray-600">
            Test your LFS builds and generate bootable ISO images
          </p>
        </div>
        
        <Tabs defaultValue="runner" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="runner">Test Runner</TabsTrigger>
            <TabsTrigger value="iso" className="flex items-center gap-1">
              <Disc className="w-4 h-4" /> ISO Generation
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-1">
              <FileText className="w-4 h-4" /> Documentation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="runner">
            <TestRunner />
          </TabsContent>
          
          <TabsContent value="iso">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Disc className="h-5 w-5" />
                  ISO Generation
                </CardTitle>
                <CardDescription>
                  Generate bootable ISO images from successful LFS builds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    ISO generation creates bootable or non-bootable ISO images from your completed LFS builds.
                    Test configurations with <code className="px-1 py-0.5 bg-gray-100 rounded">iso_generation.generate</code> set to true
                    will automatically trigger ISO creation after a successful build.
                  </p>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Simulation Mode</AlertTitle>
                    <AlertDescription>
                      The ISO generation is currently in simulation mode. In a production environment, 
                      it would use tools like xorriso or mkisofs to create real bootable ISO images.
                    </AlertDescription>
                  </Alert>
                  
                  <p>
                    When a test run completes successfully, the ISO image will be generated automatically
                    and available for download from the test results page.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">ISO Customization</h3>
                  <p>
                    You can customize the ISO generation process by modifying the following options in your test configuration:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>iso_name</strong>: Name of the generated ISO file</li>
                    <li><strong>label</strong>: Volume label for the ISO</li>
                    <li><strong>bootloader</strong>: Bootloader to use (grub or isolinux)</li>
                    <li><strong>bootable</strong>: Whether to make the ISO bootable</li>
                  </ul>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
                    className="mt-2"
                  >
                    {showAdvancedInfo ? "Hide" : "Show"} Advanced Information
                  </Button>
                  
                  {showAdvancedInfo && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="text-lg font-semibold">How ISO Generation Works</h3>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>The test builder completes the LFS build process</li>
                        <li>If ISO generation is enabled, the IsoGenerator class is called</li>
                        <li>A temporary directory structure is created for the ISO</li>
                        <li>LFS build files are copied to this structure</li>
                        <li>System configuration files are created</li>
                        <li>Bootloader files are added if the ISO is bootable</li>
                        <li>The ISO image is created using xorriso/mkisofs (simulated in this demo)</li>
                        <li>The ISO is made available for download</li>
                        <li>Temporary files are cleaned up (optional)</li>
                      </ol>
                      
                      <h3 className="text-lg font-semibold mt-4">Real-world ISO Generation</h3>
                      <p>
                        In a production environment, the ISO generation would use actual tools like xorriso,
                        genisoimage, or mkisofs to create bootable ISO images. The generated ISOs would contain:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>A complete Linux file system hierarchy</li>
                        <li>A bootable kernel and initial ramdisk</li>
                        <li>A properly configured bootloader (GRUB or isolinux)</li>
                        <li>All the binaries and libraries from the LFS build</li>
                        <li>System configuration files</li>
                      </ul>
                      
                      <h3 className="text-lg font-semibold mt-4">Using Generated ISOs</h3>
                      <p>
                        Generated ISO images can be:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Burned to optical media (CD/DVD)</li>
                        <li>Written to USB drives using dd or similar tools</li>
                        <li>Tested in virtual machines (like QEMU, VirtualBox, VMware)</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Testing Documentation
                </CardTitle>
                <CardDescription>
                  Learn how to use the LFS testing framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Configurations</h3>
                  <p>
                    Test configurations define how your LFS build will be executed during testing.
                    You can use predefined configurations or create custom ones.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">Running Tests</h3>
                  <p>
                    Select a test configuration and click the "Run Test" button to start the test.
                    The test will simulate building LFS according to the selected configuration.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">Test Results</h3>
                  <p>
                    After the test completes, you'll see the results including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Test status (success or failure)</li>
                    <li>Build ID</li>
                    <li>Duration</li>
                    <li>Completed phases</li>
                    <li>Test logs</li>
                    <li>ISO download link (if ISO generation was enabled)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Testing;
