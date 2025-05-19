
import React from "react";
import { Info } from "lucide-react";

interface EmptyIsoStateProps {
  activeTab: "current" | "all";
  currentBuildId?: string;
}

const EmptyIsoState: React.FC<EmptyIsoStateProps> = ({ activeTab, currentBuildId }) => {
  return (
    <div className="text-center py-8 border rounded-md bg-gray-50">
      <Info className="h-8 w-8 text-gray-400 mx-auto" />
      <h3 className="mt-2 text-gray-600 font-medium">No ISO images available</h3>
      <p className="mt-1 text-sm text-gray-500">
        {activeTab === "current" && currentBuildId 
          ? "No ISO images have been generated for this build yet." 
          : "No ISO images have been generated."}
      </p>
    </div>
  );
};

export default EmptyIsoState;
