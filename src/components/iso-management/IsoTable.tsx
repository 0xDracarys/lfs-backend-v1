
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IsoMetadata } from "@/lib/testing/iso-generator";
import IsoTableRow from "./IsoTableRow";

interface IsoTableProps {
  isoData: IsoMetadata[];
  generatingIsos: Record<string, {
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    message?: string;
    jobId?: string;
  }>;
  onGenerateRealIso: (iso: IsoMetadata) => void;
  apiConfigured: boolean; // Added prop
}

const IsoTable: React.FC<IsoTableProps> = ({ 
  isoData, 
  generatingIsos, 
  onGenerateRealIso,
  apiConfigured // Destructured prop
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ISO Name</TableHead>
            <TableHead>Build</TableHead>
            <TableHead>Generated On</TableHead>
            <TableHead>Configuration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isoData.map((iso, i) => {
            const generationStatus = generatingIsos[iso.isoName] || null;
            
            return (
              <IsoTableRow
                key={`${iso.buildId}-${iso.isoName}-${i}`}
                iso={iso}
                index={i}
                generationStatus={generationStatus}
                onGenerateRealIso={onGenerateRealIso}
                apiConfigured={apiConfigured} // Pass prop down
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default IsoTable;
