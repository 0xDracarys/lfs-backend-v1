
import React from "react";
import TestRunner from "@/components/TestRunner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Disc, FileText } from "lucide-react";

const Testing: React.FC = () => {
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
                    ISO generation is automatically available for test configurations that have 
                    <code className="px-1 py-0.5 bg-gray-100 rounded">iso_generation.generate</code> set to true.
                  </p>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Important Note</h4>
                      <p className="text-amber-700 text-sm">
                        The ISO generation is fully functional but runs in simulation mode. In a production environment, 
                        it would use tools like xorriso or mkisofs to create real bootable ISO images.
                      </p>
                    </div>
                  </div>
                  
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
                  </ul>
                  
                  <h3 className="text-lg font-semibold mt-4">How ISO Generation Works</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>The test builder completes the LFS build process</li>
                    <li>If ISO generation is enabled, the IsoGenerator class is called</li>
                    <li>A temporary directory structure is created for the ISO</li>
                    <li>LFS build files are copied to this structure</li>
                    <li>Bootloader files are added if the ISO is bootable</li>
                    <li>The ISO image is created using xorriso/mkisofs (simulated in this demo)</li>
                    <li>The ISO is made available for download</li>
                  </ol>
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
