
import React from "react";

const ProcessFlow: React.FC = () => {
  return (
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
  );
};

export default ProcessFlow;
