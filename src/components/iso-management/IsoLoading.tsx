
import React from "react";
import { Disc } from "lucide-react";

const IsoLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-pulse flex flex-col items-center">
        <Disc className="h-8 w-8 text-gray-300 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading ISO data...</p>
      </div>
    </div>
  );
};

export default IsoLoading;
