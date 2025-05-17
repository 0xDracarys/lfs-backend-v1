
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Database, Disc, Docker, HardDrive, Server, Workflow } from "lucide-react";

const DockerArchitecture: React.FC = () => {
  return (
    <div className="p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Docker className="w-6 h-6" />
            <CardTitle>Docker Integration Architecture</CardTitle>
          </div>
          <CardDescription>
            How LFS Builder leverages Docker for reproducible builds and ISO generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <HardDrive className="w-5 h-5" /> Host System
              </h3>
              <div className="space-y-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-md border">
                  <p className="font-medium">LFS Builder Application</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>React UI Components</li>
                    <li>Test Runner</li>
                    <li>IsoGenerator</li>
                    <li>DockerService</li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-md border">
                  <p className="font-medium">File System</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Source Directories</li>
                    <li>Output Directories</li>
                    <li>Configuration Files</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-full border border-blue-300">
                  <Docker className="w-8 h-8 text-blue-700" />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs bg-blue-100 rounded-full px-2 py-0.5">
                    Docker API
                  </div>
                </div>
                <div className="h-16 border-l border-dashed border-gray-300 my-2"></div>
                <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-full border border-blue-300">
                  <Workflow className="w-8 h-8 text-blue-700" />
                </div>
                <div className="text-xs text-center mt-1">Volume Mounts</div>
              </div>
            </div>
            
            <div className="flex-1 border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Server className="w-5 h-5" /> Docker Container
              </h3>
              <div className="space-y-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-md border">
                  <p className="font-medium">ISO Builder Image</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Ubuntu 22.04 Base</li>
                    <li>xorriso</li>
                    <li>GRUB/ISOLINUX Tools</li>
                    <li>ISO Generation Scripts</li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-md border">
                  <p className="font-medium">Mount Points</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>/lfs-source (read-only)</li>
                    <li>/output (read-write)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Process Flow</h3>
            <ol className="relative border-l border-gray-200 ml-3 space-y-6">
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">1</span>
                </span>
                <h4 className="font-semibold">Test Configuration Selection</h4>
                <p className="text-sm text-gray-600 mt-1">User selects or creates a test configuration with ISO generation enabled</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">2</span>
                </span>
                <h4 className="font-semibold">Docker Availability Check</h4>
                <p className="text-sm text-gray-600 mt-1">Application checks if Docker is available on the host system</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">3</span>
                </span>
                <h4 className="font-semibold">Docker Image Build/Check</h4>
                <p className="text-sm text-gray-600 mt-1">Ensures the ISO builder Docker image exists, building it if necessary</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">4</span>
                </span>
                <h4 className="font-semibold">LFS Build Execution</h4>
                <p className="text-sm text-gray-600 mt-1">Runs the LFS build process according to the test configuration</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">5</span>
                </span>
                <h4 className="font-semibold">Docker Container Launch</h4>
                <p className="text-sm text-gray-600 mt-1">Starts Docker container with source and output volumes mounted</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">6</span>
                </span>
                <h4 className="font-semibold">ISO Generation</h4>
                <p className="text-sm text-gray-600 mt-1">Container runs the ISO generation script to create a bootable ISO</p>
              </li>
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <span className="text-xs font-medium">7</span>
                </span>
                <h4 className="font-semibold">ISO Verification &amp; Download</h4>
                <p className="text-sm text-gray-600 mt-1">Generated ISO is verified and made available for download</p>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5" />
              <CardTitle>ISO Generation Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <span><strong>Multiple Bootloaders:</strong> Support for both GRUB and ISOLINUX</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <span><strong>Non-bootable Option:</strong> Create data-only ISOs when needed</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <span><strong>Custom Volume Labels:</strong> Set your own ISO volume identifier</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <span><strong>Seamless Integration:</strong> ISO generation triggered automatically after successful builds</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <CardTitle>Docker Benefits</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Isolation:</strong> Build processes run in isolated containers</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Reproducibility:</strong> Consistent environment for builds</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Tool Availability:</strong> All necessary tools pre-installed</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Clean Environment:</strong> No host system contamination</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DockerArchitecture;
