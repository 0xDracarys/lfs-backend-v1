
import React from "react";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface IsoGenerationStatusProps {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
}

const IsoGenerationStatus: React.FC<IsoGenerationStatusProps> = ({ 
  status, 
  progress, 
  message 
}) => {
  return (
    <div className="w-full max-w-[200px]">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{status}</span>
        <span>{progress || 0}%</span>
      </div>
      <Progress value={progress || 0} className="h-2 mb-1" />
      <p className="text-xs text-gray-500 truncate">
        {status === "failed" ? (
          <span className="text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {message || "Failed"}
          </span>
        ) : (
          message || "Processing..."
        )}
      </p>
    </div>
  );
};

export default IsoGenerationStatus;
