
import React from "react";
import { Cpu, Server, Workflow } from "lucide-react";
import { HardDrive } from "lucide-react";

const DockerDiagram: React.FC = () => {
  return (
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
            <Cpu className="w-8 h-8 text-blue-700" />
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
  );
};

export default DockerDiagram;
