
import React from "react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, Database, CheckCircle2 } from "lucide-react";
import { IsoMetadata } from "@/lib/testing/iso-generator";
import { formatDate, handleDownload } from "./utils/iso-utils";
import IsoGenerationStatus from "./IsoGenerationStatus";

interface IsoTableRowProps {
  iso: IsoMetadata;
  index: number;
  generationStatus: {
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    message?: string;
    jobId?: string;
  } | null;
  onGenerateRealIso: (iso: IsoMetadata) => void;
}

const IsoTableRow: React.FC<IsoTableRowProps> = ({ 
  iso, 
  index, 
  generationStatus,
  onGenerateRealIso 
}) => {
  const isGenerating = generationStatus !== null;
  
  return (
    <TableRow key={`${iso.buildId}-${iso.isoName}-${index}`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {iso.isoName}
          {generationStatus?.status === "completed" && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">
        {iso.buildId.substring(0, 8)}...
      </TableCell>
      <TableCell>
        {formatDate(iso.timestamp)}
      </TableCell>
      <TableCell>{iso.configName}</TableCell>
      <TableCell>
        <Badge variant={iso.bootable ? "default" : "outline"}>
          {iso.bootable ? `Bootable (${iso.bootloader})` : "Data only"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isGenerating && generationStatus?.status !== "completed" && (
            <IsoGenerationStatus
              status={generationStatus.status}
              progress={generationStatus.progress || 0}
              message={generationStatus.message}
            />
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => onGenerateRealIso(iso)}
            disabled={isGenerating && generationStatus?.status !== "failed"}
          >
            <Database className="h-4 w-4" /> Generate Real ISO
          </Button>
          
          <Button 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => handleDownload(iso)}
          >
            <FileDown className="h-4 w-4" /> Download
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default IsoTableRow;
