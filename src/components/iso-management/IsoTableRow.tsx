
import React, { useState } from "react"; // Added useState
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, Database, CheckCircle2, Github } from "lucide-react"; // Added Github icon
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"; // Import Dialog components
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
  apiConfigured: boolean; // Added prop
}

const IsoTableRow: React.FC<IsoTableRowProps> = ({ 
  iso, 
  index, 
  generationStatus,
  onGenerateRealIso,
  apiConfigured // Destructured prop
}) => {
  const isGenerating = generationStatus !== null;
  const [showGitHubActionsModal, setShowGitHubActionsModal] = useState(false);
  
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
          
          {apiConfigured ? (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onGenerateRealIso(iso)}
              disabled={isGenerating && generationStatus?.status !== "failed"}
              title="Request ISO generation from the configured backend service."
            >
              <Database className="h-4 w-4" /> Generate Real ISO
            </Button>
          ) : (
            <Dialog open={showGitHubActionsModal} onOpenChange={setShowGitHubActionsModal}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-muted-foreground"
                  title="Real ISO generation via backend is not configured. Click for GitHub Actions instructions."
                >
                  <Github className="h-4 w-4" /> Generate via GitHub
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate ISO via GitHub Actions</DialogTitle>
              <DialogDescription asChild>
                <div>
                  To generate this ISO:
                  <ol className="list-decimal list-inside my-2 space-y-1 pl-4">
                    <li>Go to your project's GitHub repository.</li>
                    <li>Navigate to the <strong>Actions</strong> tab.</li>
                    <li>Find and select the <strong>Generate LFS ISO</strong> workflow.</li>
                    <li>Click <strong>Run workflow</strong>.</li>
                    <li>Use the following inputs:
                      <ul className="list-disc list-inside pl-6 my-1 space-y-0.5 text-sm text-muted-foreground">
                        <li>Build ID: <code>{iso.buildId}</code> (or <code>{iso.configName}</code>)</li>
                        <li>Source Path: (Use default <code>./lfs_root_fs_output</code> or specify if known)</li>
                        <li>ISO Filename: <code>{iso.isoName}</code></li>
                      </ul>
                    </li>
                    <li>After the workflow completes, download the ISO from the workflow run's <strong>Artifacts</strong> section.</li>
                  </ol>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowGitHubActionsModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          )}
          
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
